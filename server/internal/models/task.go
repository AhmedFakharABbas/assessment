package models

import "time"

// Task represents a task with GIS information.
type Task struct {
	ID          int       `db:"id" json:"id"`
	Name        string    `db:"name" json:"name"`
	Description string    `db:"description" json:"description"`
	Status      string    `db:"status" json:"status"`
	CreatedBy   int       `db:"created_by" json:"created_by"`
	Latitude    float64   `json:"latitude"` 
	Longitude   float64   `json:"longitude"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time `db:"updated_at" json:"updated_at"`
}
