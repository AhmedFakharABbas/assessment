package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// RBAC middleware checks if the user has the required role.
func RBAC(requiredRole string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists || role != requiredRole {
			c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: insufficient privileges"})
			c.Abort()
			return
		}
		c.Next()
	}
}
