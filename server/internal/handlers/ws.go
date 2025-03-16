package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// Upgrader configures the WebSocket connection upgrade.
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// A simple hub to manage connected clients.
var clients = make(map[*websocket.Conn]bool)

// WebSocket endpoint: upgrade HTTP connection to WebSocket.
func WebSocketHandler(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	defer conn.Close()
	clients[conn] = true

	// Listen for messages (or you could implement a broadcast system)
	for {
		var msg map[string]interface{}
		if err := conn.ReadJSON(&msg); err != nil {
			delete(clients, conn)
			break
		}
		// Broadcast received message to all connected clients.
		for client := range clients {
			if err := client.WriteJSON(msg); err != nil {
				client.Close()
				delete(clients, client)
			}
		}
	}
}
