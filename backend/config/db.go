package config

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var DB *mongo.Database

func ConnectDB() {
	uri := os.Getenv("MONGODB_URI")

	client, err := mongo.Connect(options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatal(err)
	}

	ctx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}

	DB = client.Database("pulsepoll")

	// Create unique index for one vote per voter per poll
	voteCollection := DB.Collection("votes")

	_, err = voteCollection.Indexes().CreateOne(
		ctx,
		mongo.IndexModel{
			Keys: bson.D{
				{Key: "poll_id", Value: 1},
				{Key: "voter_id", Value: 1},
			},
			Options: options.Index().SetUnique(true),
		},
	)

	if err != nil {
		log.Fatal("Failed to create vote index:", err)
	}

	log.Println("MongoDB connected successfully")
	log.Println("Vote duplicate protection enabled")
}