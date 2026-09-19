package routes

import (
	"pulse-poll-backend/controllers"
	"pulse-poll-backend/middleware"

	"github.com/gin-gonic/gin"
)

func PollRoutes(router *gin.Engine) {
	poll := router.Group("/api/polls")
	{
		// Create poll - login required
		poll.POST(
			"/",
			middleware.AuthMiddleware(),
			controllers.CreatePoll,
		)

		// Get logged-in user's polls - login required
		poll.GET(
			"/mine",
			middleware.AuthMiddleware(),
			controllers.GetMyPolls,
		)

		// Get poll - public
		poll.GET(
			"/:id",
			controllers.GetPollByID,
		)

		// Vote on poll - public
		poll.POST(
			"/:id/vote",
			controllers.Vote,
		)

		// Get live poll results - public
		poll.GET(
			"/:id/results",
			controllers.GetPollResults,
		)

		// WebSocket - live poll updates
		poll.GET(
			"/:id/ws",
			controllers.PollWebSocket,
		)
	}
}
