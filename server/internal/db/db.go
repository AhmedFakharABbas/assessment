package db
import (
	"fmt"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

var DB *sqlx.DB

func InitDB(dataSourceName string) {
	fmt.Println("InitDB ...")

	var err error
	DB, err = sqlx.Connect("postgres", dataSourceName)
	if err != nil {
		log.Fatalf("Cannot connect to DB: %v", err)
	}
	// Optionally set connection pool parameters
	DB.SetMaxOpenConns(25)
	DB.SetMaxIdleConns(25)
	DB.SetConnMaxLifetime(5 * time.Minute)
}
