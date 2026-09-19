package controllers

import (
	"net/http"

	"pulse-poll-backend/redis"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func PollWebSocket(c *gin.Context) {
	pollID := c.Param("id")

	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)

	if err != nil {
		return
	}

	defer conn.Close()

	// Subscribe to Redis Pub/Sub
	pubsub := redis.SubscribeToPoll(pollID)
	defer pubsub.Close()

	// Listen for Redis messages
	ch := pubsub.Channel()

	for msg := range ch {
		err := conn.WriteMessage(
			websocket.TextMessage,
			[]byte(msg.Payload),
		)

		if err != nil {
			return
		}
	}
}