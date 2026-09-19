package main

import (
	"log"
	"net/http"
	"os"

	"pulse-poll-backend/config"
	"pulse-poll-backend/redis"
	"pulse-poll-backend/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env locally.
	// On Render, environment variables are provided by the platform.
	_ = godotenv.Load()

	// Connect to MongoDB
	config.ConnectDB()

	// Connect to Redis
	redis.ConnectRedis()

	// Create Gin router
	router := gin.Default()

	// CORS configuration
	// All known frontend URLs are listed directly here.
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",
			"https://pulse-poll-weld.vercel.app",
			"https://pulse-poll-ecap.vercel.app",
		},
		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"DELETE",
			"OPTIONS",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Authorization",
		},
		AllowCredentials: true,
	}))

	// Authentication routes
	routes.AuthRoutes(router)

	// Poll routes
	routes.PollRoutes(router)

	// Health check / root endpoint
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "PulsePoll backend is running!",
		})
	})

	// Render provides the PORT environment variable.
	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}

	log.Println("PulsePoll backend running on port:", port)

	// Start server
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}