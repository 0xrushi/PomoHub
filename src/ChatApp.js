import React, { useState, useEffect, useRef } from "react";
import { Popover } from "@mui/material";

import IconButton from "@mui/material/IconButton";
import SettingsApplicationsRoundedIcon from "@mui/icons-material/SettingsApplicationsRounded";
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
import { SketchPicker } from "react-color";
import AppTimer from "./AppTimer";

import Box from "@mui/material/Box";
import { FormControl, FormLabel } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import MembersDisplay from "./components/memberdisplay/MemberDisplay";
import SettingsComponent from "./components/settingscomponent/SettingsComponent";
import tinycolor from "tinycolor2";

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [isUsernameDialogOpen, setIsUsernameDialogOpen] = useState(true);
  const [toggleGridState, setToggleGridState] = useState(true);

  const matches = useMediaQuery("(min-width:600px)");

  const [isOpen, setIsOpen] = useState(false);

  const togglePicker = () => {
    setIsOpen(!isOpen);
  };

  const socketRef = useRef();

  const [members, setMembers] = useState([]);

  useEffect(() => {
    document.body.style.backgroundColor = backgroundColor;

    socketRef.current = io(process.env.REACT_APP_API_URL);

    socketRef.current.on("chat history", (history) => {
      setMessages(history);
    });

    socketRef.current.on("new message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    // Listen for updates to the user list from the server
    socketRef.current.on("update user list", (updatedUserList) => {
      const updatedMembers = updatedUserList.map((user) => ({
        name: user.name,
        isCurrentUser: true,
      }));
      setMembers(updatedMembers);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleUsernameSubmit = () => {
    setIsUsernameDialogOpen(false);
    // Emit the username to the server
    socketRef.current.emit("submit username", userName);
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

  const [anchorEl, setAnchorEl] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState("#ff7200");

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const changeBackgroundColor = (color) => {
    setBackgroundColor(color);
    handleClose(); // Close the popover after changing the color
  };

  const handleToggleGrid = () => {
    setToggleGridState(!toggleGridState);
  };

  // Example function for handling background image change
  const changeBackgroundImage = () => {
    // Placeholder for actual implementation
    console.log("Change background image clicked");
    handleClose(); // Close the popover after selecting the image
  };

  const theme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#000",
      },
      background: {
        default: backgroundColor, //"#ff7200",
        paper: backgroundColor, //"#ff7200",
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
  }, [messages]);

  return (
    <ThemeProvider theme={theme}>
      <Grid container sx={{ backgroundColor: backgroundColor }}>
        {toggleGridState && (
          <Grid
            item
            lg={matches ? 8 : 0}
            sx={{ backgroundColor: backgroundColor, paddingLeft: "8px" }}
          >
            {matches && (
              <>
                <Dialog
                  open={isUsernameDialogOpen}
                  onClose={{}}
                  aria-labelledby="form-dialog-title"
                >
                  <DialogTitle id="form-dialog-title">
                    Enter Username
                  </DialogTitle>
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
                    // maxHeight: "98%",
                    height: "calc(98vh - 120px)",
                    overflow: "auto",
                    marginBottom: "50px",
                    backgroundColor: theme.palette.background.paper,
                  }}
                >
                  {messages.map((msg, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        backgroundColor:
                          index % 2 === 0
                            ? tinycolor(backgroundColor).darken(5).toString()
                            : tinycolor(backgroundColor).darken(10).toString(),
                        color: "white",
                      }}
                    >
                      <ListItemText primary={`${msg.name}: ${msg.message}`} />
                    </ListItem>
                  ))}
                  <div ref={messagesEndRef} />
                </List>

                {/* MembersDisplay */}

                {/* The chat input form */}
                <Grid
                  container
                  sx={{
                    position: "sticky",
                    bottom: 0,
                    background: backgroundColor,
                    padding: "8px",
                    boxSizing: "border-box",
                  }}
                >
                  {/* Using FormControl for the form area */}
                  <FormControl
                    fullWidth
                    style={{ display: "flex", flexDirection: "row" }}
                  >
                    {/* Text field */}
                    <TextField
                      variant="outlined"
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      sx={{
                        input: { color: "black", backgroundColor: "white" },
                        flexGrow: 1,
                        mr: 1,
                      }}
                    />
                    {/* Emoji button */}
                    <Button
                      type="button"
                      variant="contained"
                      color="primary"
                      sx={{
                        maxHeight: "56px", // Match the TextField height
                        mr: 1, // Add margin right
                      }}
                      onClick={togglePicker}
                    >
                      😀
                    </Button>
                    {/* Send button */}
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{
                        maxHeight: "56px", // Match the TextField height
                      }}
                      onClick={sendMessage} // Call the sendMessage function when clicked
                    >
                      Send
                    </Button>
                  </FormControl>
                </Grid>

                {/* EmojiPicker */}
                <Grid
                  container
                  style={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    background: backgroundColor,
                    padding: "8px",
                    width: "100%",
                  }}
                >
                  <div style={{ position: "relative", width: "100%" }}>
                    {isOpen && (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: "60px",
                          left: 0,
                          right: 0,
                          zIndex: 1000,
                        }}
                      >
                        <EmojiPicker
                          // prettier-ignore
                          onEmojiClick={(emojiObject) =>
                      setMessage(
                        (previousMessage) => previousMessage + emojiObject.emoji
                      )
                    }
                          pickerStyle={{ width: "auto" }}
                        />
                      </Box>
                    )}
                  </div>
                </Grid>
              </>
            )}
          </Grid>
        )}
        {/* Right side column for timer or other components */}
        <Grid
          item
          xs={matches && toggleGridState ? 4 : 12}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <SettingsComponent
            changeBackgroundColor={changeBackgroundColor}
            changeBackgroundImage={changeBackgroundImage}
            handleToggleGrid={handleToggleGrid}
          />
          <Box sx={{ position: "sticky", top: 0, width: "100%", zIndex: 1 }}>
            <MembersDisplay
              backgroundColor={backgroundColor}
              members={members}
            />
          </Box>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              paddingTop: "10px",
            }}
          >
            <AppTimer
              backgroundColor={backgroundColor}
              toggleGridState={toggleGridState}
            />
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default ChatApp;
