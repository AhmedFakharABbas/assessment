package handlers
import (
	"fmt"
	"strings"
	"net/http"
	"time"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"

	"task-manager-backend/internal/db"
	"task-manager-backend/internal/models"
)

// Define a secret key (in production, use env vars or a secure vault)
var jwtSecret = []byte("your_secret_key")

// Register handler
func Register(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing password"})
		return
	}
	user.Password = string(hashedPassword)
	// Insert user into database
	_, err = db.DB.NamedExec(`INSERT INTO users (username, password, role) VALUES (:username, :password, :role)`, &user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error saving user"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "User registered"})
}

// Login handler
func Login(c *gin.Context) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	fmt.Println("Received username:", req.Username)
	fmt.Println("Received password:", req.Password)
	req.Username = strings.TrimSpace(req.Username)



	// fmt.Printf("Executing query: 

	var user models.User

	// err := db.DB.Get(&user, "SELECT * FROM users WHERE username=$1", req.Username)
	err := db.DB.Get(&user, "SELECT * FROM users WHERE LOWER(username) = LOWER($1)", req.Username)
	if err != nil {
		fmt.Println("err:", err)

		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	// Compare hashed password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect password"})
		return
	}

	// Create JWT token with user role
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": user.Username,
		"role":     user.Role,
		"exp":      time.Now().Add(time.Hour * 72).Unix(),
	})

	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": tokenString})
}
