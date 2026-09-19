package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Vote struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id"`
	PollID    bson.ObjectID `bson:"poll_id" json:"pollId"`
	VoterID   string        `bson:"voter_id" json:"voterId"`
	OptionID  string        `bson:"option_id" json:"optionId"`
	CreatedAt time.Time     `bson:"created_at" json:"createdAt"`
}