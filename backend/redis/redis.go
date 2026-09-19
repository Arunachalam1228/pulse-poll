package redis

import (
	"context"
	"log"
	"os"

	"github.com/redis/go-redis/v9"
)

var Client *redis.Client
var Ctx = context.Background()

func ConnectRedis() {
	redisURL := os.Getenv("REDIS_ADDR")

	if redisURL == "" {
		log.Fatal("REDIS_ADDR is not set")
	}

	opt, err := redis.ParseURL(redisURL)

	if err != nil {
		log.Fatal("Invalid Redis URL: ", err)
	}

	Client = redis.NewClient(opt)

	_, err = Client.Ping(Ctx).Result()

	if err != nil {
		log.Fatal("Redis connection failed: ", err)
	}

	log.Println("Redis connected successfully")
}

func SubscribeToPoll(pollID string) *redis.PubSub {
	channel := "poll:" + pollID + ":updates"

	pubsub := Client.Subscribe(Ctx, channel)

	return pubsub
}