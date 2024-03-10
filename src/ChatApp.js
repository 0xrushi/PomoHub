import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import {
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import EmojiPicker from "emoji-picker-react";
import AppTimer from "./AppTimer";

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [isUsernameDialogOpen, setIsUsernameDialogOpen] = useState(true);

  const [isOpen, setIsOpen] = useState(false);

  const togglePicker = () => {
    setIsOpen(!isOpen);
  };

  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io("http://0.0.0.0:3000");

    socketRef.current.on("chat history", (history) => {
      setMessages(history);
    });

    socketRef.current.on("new message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleUsernameSubmit = () => {
    setIsUsernameDialogOpen(false);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socketRef.current.emit("send message", {
        name: userName,
        message: message.trim(),
      });
      setMessage("");
    }
  };

  const theme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#000",
      },
      background: {
        default: "#ff7200",
        paper: "#ff7200",
      },
      text: {
        primary: "#000",
        secondary: "#000",
      },
    },
  });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Dependency array includes messages so it runs every time messages change

  return (
    <ThemeProvider theme={theme}>
      <Grid container sx={{ backgroundColor: "#ff7200" }}>
        <Grid
          item
          xs={9}
          sx={{ backgroundColor: "#ff7200", paddingLeft: "8px" }}
        >
          <Dialog
            open={isUsernameDialogOpen}
            onClose={() => {}}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="form-dialog-title">Enter Username</DialogTitle>
            <DialogContent>
              <DialogContentText>
                To participate in the chat, please enter your username.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Username"
                type="text"
                fullWidth
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && userName.trim())
                    handleUsernameSubmit();
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleUsernameSubmit} color="primary">
                Enter Chat
              </Button>
            </DialogActions>
          </Dialog>
          <List
            sx={{
              maxHeight: "95%",
              overflow: "auto",
              marginBottom: "50px",
              width: "80%",
              backgroundColor: theme.palette.background.paper,
            }}
          >
            {messages.map((msg, index) => (
              <ListItem
                key={index}
                sx={{
                  backgroundColor: index % 2 === 0 ? "#d56309" : "#ed6f05",
                  color: "white",
                }} // Alternate list item background
                // className="bg-red-800"
              >
                <ListItemText primary={`${msg.name}: ${msg.message}`} />
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
          <form onSubmit={sendMessage}>
            <Grid
              container
              style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                width: "60%",
                background: "#ff7200",
                padding: "8px",
              }}
            >
              <Grid item xs>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  sx={{ input: { color: "black", backgroundColor: "white" } }} // Adjust text color
                />
              </Grid>
              <Grid item className="px-2">
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  sx={{
                    height: "100%",
                    fontSize: "24px",
                    background: "#1a1a1a",
                  }}
                  onClick={togglePicker}
                >
                  😀
                </Button>
              </Grid>
              <Grid item>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ height: "100%", background: "#1a1a1a" }}
                >
                  Send
                </Button>
              </Grid>
            </Grid>
          </form>
          {isOpen && (
              <EmojiPicker
                onEmojiClick={(e) =>
                  setMessage((previousMessage) => previousMessage + e.emoji)
                }
                open={isOpen}
                customEmojis={[
                  {
                    names: ['Alice', 'alice in wonderland'],
                    imgUrl:
                      'file://custom_emojis/kekpack/1128_KEK4K.png',
                    id: 'alice'
                  },
                  {
                    names: ['Dog'],
                    imgUrl:
                      'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/dog.png',
                    id: 'dog'
                  },]}
              />
          )}
        </Grid>
        <Grid item xs={3}>
          <AppTimer />
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default ChatApp;
