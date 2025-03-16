package models
import "time"

type User struct {
    ID       uint   `json:"id" gorm:"primaryKey"`
    Email    string `json:"email" gorm:"unique"`
    Password string `json:"password"`
    Username string `json:"username"` // Add this if missing
    Role     string `json:"role"`     // Add this if missing
	CreatedAt time.Time `json:"created_at" db:"created_at"` // Add this

}
