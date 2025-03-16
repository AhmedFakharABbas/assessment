package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"task-manager-backend/internal/db"
	"task-manager-backend/internal/models"
)

// GetTasks returns all tasks.
func GetTasks(c *gin.Context) {
	var tasks []models.Task
	err := db.DB.Select(&tasks, "SELECT id, name, description, status, created_by, ST_X(location::geometry) as latitude, ST_Y(location::geometry) as longitude, created_at, updated_at FROM tasks")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching tasks"})
		return
	}
	c.JSON(http.StatusOK, tasks)
}

// CreateTask creates a new task.
func CreateTask(c *gin.Context) {
	var task models.Task
	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid task data"})
		return
	}

	query := `
		INSERT INTO tasks (name, description, status, created_by, location)
		VALUES (:name, :description, :status, :created_by, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326))
		RETURNING id
	`
	rows, err := db.DB.NamedQuery(query, &task)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating task"})
		return
	}
	if rows.Next() {
		rows.Scan(&task.ID)
	}
	c.JSON(http.StatusCreated, task)
}

// UpdateTask updates an existing task.
func UpdateTask(c *gin.Context) {
	id := c.Param("id")
	var task models.Task
	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid task data"})
		return
	}
	taskID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid task ID"})
		return
	}
	task.ID = taskID

	query := `
		UPDATE tasks SET name=:name, description=:description, status=:status,
		location=ST_SetSRID(ST_MakePoint(:longitude, :latitude),4326), updated_at=NOW()
		WHERE id=:id
	`
	_, err = db.DB.NamedExec(query, &task)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating task"})
		return
	}
	c.JSON(http.StatusOK, task)
}

// DeleteTask deletes a task. (Admins only)
func DeleteTask(c *gin.Context) {
	id := c.Param("id")
	_, err := db.DB.Exec("DELETE FROM tasks WHERE id=$1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting task"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Task deleted"})
}

// GetTasksNearby returns tasks within a given radius (in meters)
func GetTasksNearby(c *gin.Context) {
	lat := c.Query("lat")
	lng := c.Query("lng")
	radius := c.Query("radius")
	// For brevity, convert lat, lng, radius to numbers and handle errors appropriately
	query := `
		SELECT id, name, description, status, created_by,
		       ST_X(location::geometry) as latitude,
		       ST_Y(location::geometry) as longitude,
		       created_at, updated_at
		FROM tasks
		WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint($1, $2),4326)::geography, $3::float)
	`
	var tasks []models.Task
	err := db.DB.Select(&tasks, query, lat, lng, radius)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching nearby tasks"})
		return
	}
	c.JSON(http.StatusOK, tasks)
}
