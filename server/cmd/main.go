package main
import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"task-manager-backend/internal/db"
	"task-manager-backend/internal/handlers"
	"task-manager-backend/internal/middleware"
)
func main() {
	 connStr := "postgres://postgres:hawk@localhost:5432/tasksdb?sslmode=disable"

	 db.InitDB(connStr)
	 r := gin.Default()

	 // Public routes
	 public := r.Group("/")
	 {
		 public.POST("/register", handlers.Register)
		 public.POST("/login", handlers.Login)
	 }
 
	 // Protected routes
	 protected := r.Group("/")
	 protected.Use(middleware.JWTAuth())
	 {
		 // Task management
		 protected.GET("/tasks", handlers.GetTasks)
		 protected.POST("/tasks", handlers.CreateTask)
		 protected.PUT("/tasks/:id", handlers.UpdateTask)
		 // Delete requires admin role:
		 protected.DELETE("/tasks/:id", middleware.RBAC("Admin"), handlers.DeleteTask)
		 // Location-based query
		 protected.GET("/tasks/nearby", handlers.GetTasksNearby)
 
		 // WebSocket endpoint (could also be public if needed)
		 protected.GET("/ws", handlers.WebSocketHandler)
	 }
 
	 // Start server
	 port := os.Getenv("PORT")
	 if port == "" {
		 port = "9070"
	 }
	 if err := r.Run(":" + port); err != nil {
		 log.Fatalf("Error starting server: %v", err)
	 }
}
