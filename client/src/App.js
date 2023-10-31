import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";
const socket = io("http://localhost:4200");

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [users, setUsers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    socket.on("user-status", (statusData) => {
      const { username, online } = statusData;
      setUsers((prevUsers) => {
        const userIndex = prevUsers.findIndex(
          (user) => user.username === username
        );
        if (userIndex !== -1) {
          prevUsers[userIndex].online = online;
          return [...prevUsers];
        } else {
          return [...prevUsers, { username, online }];
        }
      });
    });

    socket.on("message", (messageData) => {
      setChatMessages((prevMessages) => [...prevMessages, messageData]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleUsernameSubmit = () => {
    if (username) {
      // Send the chosen username to the server
      socket.emit("set-username", username);
      setLoggedIn(true);
    }
  };

  const sendMessage = () => {
    if (message || image) {
      // Send a message (including image) to the server
      const messageData = {
        username,
        message,
        image,
      };
      socket.emit("message", messageData);
      setMessage("");
      setImage(null);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Read the selected image file
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="App">
      {loggedIn ? (
        <div className="chat-container">
          <div className="user-list">
            <h2>Online Users:</h2>
            <ul>
              {users.map((user, index) => (
                <li key={index}>
                  {user.username} {user.online ? "(Online)" : "(Offline)"}
                </li>
              ))}
            </ul>
          </div>
          <div className="chat">
            <div className="chat-messages">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${
                    message.username === username
                      ? "own-message"
                      : "other-message"
                  }`}
                >
                  <div className="message-username">{message.username}</div>
                  {message.message && (
                    <div className="message-text">{message.message}</div>
                  )}
                  {message.image && (
                    <img
                      className="message-image"
                      src={message.image}
                      alt="Uploaded"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div class="file-input-container">
                <label class="custom-file-input-label" for="fileInput">
                  Upload
                </label>
                <input
                  type="file"
                  id="fileInput"
                  onChange={handleImageUpload}
                />
              </div>

              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="login-container">
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleUsernameSubmit}>Start Chat</button>
        </div>
      )}
    </div>
  );
}

export default App;
