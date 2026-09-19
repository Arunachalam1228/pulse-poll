package controllers

import (
	"errors"
	"fmt"
	"net/http"
	"time"

	"pulse-poll-backend/config"
	"pulse-poll-backend/models"
	"pulse-poll-backend/redis"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// CreatePoll creates a new poll
func CreatePoll(c *gin.Context) {
	var input struct {
		Question string   `json:"question"`
		Options  []string `json:"options"`
	}

	// Read request body
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request",
		})
		return
	}

	// Basic validation
	if input.Question == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Poll question is required",
		})
		return
	}

	if len(input.Options) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "At least 2 options are required",
		})
		return
	}

	if len(input.Options) > 6 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Maximum 6 options are allowed",
		})
		return
	}

	// Validate question length
	if len(input.Question) > 200 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Question cannot exceed 200 characters",
		})
		return
	}

	options := make([]models.PollOption, 0, len(input.Options))

	// Validate and create poll options
	for i, option := range input.Options {
		if option == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Poll options cannot be empty",
			})
			return
		}

		if len(option) > 100 {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Poll options cannot exceed 100 characters",
			})
			return
		}

		options = append(options, models.PollOption{
			ID:    fmt.Sprintf("option-%d", i+1),
			Text:  option,
			Votes: 0,
		})
	}

	// Get logged-in user's ID from JWT middleware
	userID := c.GetString("userId")

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Authentication required",
		})
		return
	}

	createdBy, err := bson.ObjectIDFromHex(userID)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Invalid user ID",
		})
		return
	}

	// Create poll
	poll := models.Poll{
		ID:        bson.NewObjectID(),
		Question:  input.Question,
		Options:   options,
		CreatedBy: createdBy,
		CreatedAt: time.Now(),
	}

	// Save poll in MongoDB
	_, err = config.DB.Collection("polls").InsertOne(c, poll)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to create poll",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Poll created successfully",
		"poll":    poll,
	})
}

// GetMyPolls gets all polls created by the logged-in user
func GetMyPolls(c *gin.Context) {
	userID := c.GetString("userId")

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Authentication required",
		})
		return
	}

	createdBy, err := bson.ObjectIDFromHex(userID)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Invalid user ID",
		})
		return
	}

	// Find only polls created by this user
	cursor, err := config.DB.Collection("polls").Find(
		c,
		bson.M{
			"created_by": createdBy,
		},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to fetch polls",
		})
		return
	}

	defer cursor.Close(c)

	var polls []models.Poll

	if err := cursor.All(c, &polls); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to read polls",
		})
		return
	}

	// Return empty array instead of null
	if polls == nil {
		polls = []models.Poll{}
	}

	c.JSON(http.StatusOK, gin.H{
		"polls": polls,
	})
}

// GetPollByID gets a poll using its ID
func GetPollByID(c *gin.Context) {
	pollID := c.Param("id")

	objectID, err := bson.ObjectIDFromHex(pollID)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid poll ID",
		})
		return
	}

	var poll models.Poll

	err = config.DB.Collection("polls").
		FindOne(c, bson.M{
			"_id": objectID,
		}).
		Decode(&poll)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			c.JSON(http.StatusNotFound, gin.H{
				"message": "Poll not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to fetch poll",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"poll": poll,
	})
}

// Vote records a vote in MongoDB and Redis
// Duplicate votes are prevented using MongoDB
func Vote(c *gin.Context) {
	var input struct {
		OptionID string `json:"optionId"`
		VoterID  string `json:"voterId"`
	}

	// Read request body
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request",
		})
		return
	}

	// Validate option ID
	if input.OptionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Option ID is required",
		})
		return
	}

	// Validate voter ID
	if input.VoterID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Voter ID is required",
		})
		return
	}

	pollID := c.Param("id")

	objectID, err := bson.ObjectIDFromHex(pollID)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid poll ID",
		})
		return
	}

	// Check that the poll exists
	var poll models.Poll

	err = config.DB.Collection("polls").
		FindOne(c, bson.M{
			"_id": objectID,
		}).
		Decode(&poll)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			c.JSON(http.StatusNotFound, gin.H{
				"message": "Poll not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to fetch poll",
		})
		return
	}

	// Check that selected option exists
	optionExists := false

	for _, option := range poll.Options {
		if option.ID == input.OptionID {
			optionExists = true
			break
		}
	}

	if !optionExists {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid option",
		})
		return
	}

	// Check whether voter has already voted
	var existingVote models.Vote

	err = config.DB.Collection("votes").
		FindOne(
			c,
			bson.M{
				"poll_id":  objectID,
				"voter_id": input.VoterID,
			},
		).
		Decode(&existingVote)

	if err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"message": "You have already voted on this poll",
		})
		return
	}

	if !errors.Is(err, mongo.ErrNoDocuments) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to check previous vote",
		})
		return
	}

	// Create vote record
	vote := models.Vote{
		ID:        bson.NewObjectID(),
		PollID:    objectID,
		VoterID:   input.VoterID,
		OptionID:  input.OptionID,
		CreatedAt: time.Now(),
	}

	// Save vote in MongoDB
	_, err = config.DB.Collection("votes").InsertOne(c, vote)

	if err != nil {
		// MongoDB unique index also protects against race-condition duplicates
		if mongo.IsDuplicateKeyError(err) {
			c.JSON(http.StatusConflict, gin.H{
				"message": "You have already voted on this poll",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to save vote",
		})
		return
	}

	// Redis key for this poll option
	redisKey := fmt.Sprintf(
		"poll:%s:option:%s",
		pollID,
		input.OptionID,
	)

	// Increment vote count in Redis
	count, err := redis.Client.
		Incr(
			redis.Ctx,
			redisKey,
		).
		Result()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to record vote count",
		})
		return
	}

	// Redis Pub/Sub channel
	channel := fmt.Sprintf(
		"poll:%s:updates",
		pollID,
	)

	// Create realtime event
	event := fmt.Sprintf(
		`{"optionId":"%s","votes":%d}`,
		input.OptionID,
		count,
	)

	// Publish realtime update
	err = redis.Client.
		Publish(
			redis.Ctx,
			channel,
			event,
		).
		Err()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to publish vote update",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Vote recorded successfully",
		"pollId":   pollID,
		"optionId": input.OptionID,
		"votes":    count,
	})
}

// GetPollResults gets live vote counts from Redis
func GetPollResults(c *gin.Context) {
	pollID := c.Param("id")

	objectID, err := bson.ObjectIDFromHex(pollID)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid poll ID",
		})
		return
	}

	// Get poll information from MongoDB
	var poll models.Poll

	err = config.DB.Collection("polls").
		FindOne(c, bson.M{
			"_id": objectID,
		}).
		Decode(&poll)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			c.JSON(http.StatusNotFound, gin.H{
				"message": "Poll not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to fetch poll",
		})
		return
	}

	type ResultOption struct {
		ID    string `json:"id"`
		Text  string `json:"text"`
		Votes int64  `json:"votes"`
	}

	results := make([]ResultOption, 0, len(poll.Options))

	var totalVotes int64

	// Read live vote counts from Redis
	for _, option := range poll.Options {
		redisKey := fmt.Sprintf(
			"poll:%s:option:%s",
			pollID,
			option.ID,
		)

		votes, err := redis.Client.
			Get(
				redis.Ctx,
				redisKey,
			).
			Int64()

		if err != nil {
			votes = 0
		}

		results = append(results, ResultOption{
			ID:    option.ID,
			Text:  option.Text,
			Votes: votes,
		})

		totalVotes += votes
	}

	c.JSON(http.StatusOK, gin.H{
		"poll": gin.H{
			"id":       poll.ID,
			"question": poll.Question,
		},
		"options":    results,
		"totalVotes": totalVotes,
	})
}
