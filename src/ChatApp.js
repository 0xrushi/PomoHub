import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import {
  Container,
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
import { emojiList } from "./config/emojilist";

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [isUsernameDialogOpen, setIsUsernameDialogOpen] = useState(true);

  const [showPicker, setShowPicker] = useState(false);

  const togglePicker = () => setShowPicker(!showPicker);

  const onEmojiClick = (event, emojiObject) => {
    console.log(emojiObject);
  };

  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io("http://localhost:3000");

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
      socketRef.current.emit("new message", {
        name: userName,
        message: message.trim(),
      });
      setMessage("");
    }
  };

  const theme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#000',
      },
      background: {
        default: '#ff7200',
        paper: '#ff7200',
      },
      text: {
        primary: '#000',
        secondary: '#000',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Grid container>
        <Grid item xs={6} sx={{"background": "#ff7200", "padding-left":"8px"}}>
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
              <Button
                onClick={handleUsernameSubmit}
                color="primary"
              >
                Enter Chat
              </Button>
            </DialogActions>
          </Dialog>
          <List
            sx={{
              maxHeight: "80vh",
              overflow: "auto",
              marginBottom: "50px",
              backgroundColor: theme.palette.background.paper,
            }}
          >
            {messages.map((msg, index) => (
              <ListItem
                key={index}
                sx={{ backgroundColor: index % 2 === 0 ? "#d56309" : "#ed6f05" , color: "white"}} // Alternate list item background
                // className="bg-red-800"
              >
                <ListItemText primary={`${msg.name}: ${msg.message}`} />
              </ListItem>
            ))}
          </List>
          <form onSubmit={sendMessage} >
            <Grid container spacing={1} >
              <Grid item xs>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  sx={{ input: { color: 'black', backgroundColor: 'white' } }} // Adjust text color
                />
              </Grid>
              <Grid item>
                <Button
                  type="button"
                  onClick={togglePicker}
                  variant="contained"
                  color="secondary"
                  sx={{ height: "100%", fontSize: "24px", background: "#1a1a1a" }}
                >
                  😀
                </Button>
              </Grid>
              <Grid item>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ height: "100%" }}
                >
                  Send
                </Button>
              </Grid>
            </Grid>
          </form>
          <EmojiPicker
            onEmojiClick={(e) => setMessage(message + e.emoji)}
            open={showPicker}
            customEmojis={emojiList}
          />
        </Grid>
        <Grid item xs={6}>
          <AppTimer />
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default ChatApp;
