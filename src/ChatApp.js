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
import { getFontColorForBackground, formatDate, formatTime } from "./utils";
import Picker from "@emoji-mart/react";

import { emojiList } from "./custom_emojis/emojilist";
import data from "@emoji-mart/data";
import kek4kImage from "./custom_emojis/kekpack/1128_KEK4K.png";

const renderMessage = (message) => {
  console.log("received message", message);

  // Improved regex to directly extract custom emoji IDs
  const regex = /:custom_(\w+):/g;

  // Use an accumulator array to build the message with JSX elements
  let messageParts = [];
  let lastIdx = 0; // Track the last index after each match

  message.replace(regex, (match, emojiId, offset) => {
    // Add text before the emoji (if any) as a plain string
    if (offset > lastIdx) {
      messageParts.push(message.slice(lastIdx, offset));
    }

    // Add the custom emoji image element
    const emojiSrc = getCustomEmojiSrcById(emojiList, emojiId);
    if (emojiSrc) {
      // Ensure emojiSrc is valid
      messageParts.push(
        <img
          key={offset}
          src={emojiSrc}
          alt=""
          style={{ height: "16px", width: "16px", verticalAlign: "middle" }}
        />,
      );
    } else {
      // If emojiSrc is not found, just return the match (or handle differently)
      messageParts.push(<p style={{ verticalAlign: "middle" }}>match</p>);
    }

    // Update lastIdx to the end of the current match
    lastIdx = offset + match.length;
  });

  // Add any remaining text after the last emoji (if any)
  if (lastIdx < message.length) {
    messageParts.push(
      <p style={{ verticalAlign: "middle" }}>{message.slice(lastIdx)}</p>,
    );
  }

  return <span style={{ display: "flex" }}>{messageParts}</span>;
};

const getCustomEmojiSrcById = (emojiList, emojiId) => {
  for (const emojiGroup of emojiList) {
    for (const emoji of emojiGroup.emojis) {
      if (
        emoji.id === emojiId &&
        emoji.custom === "true" &&
        emoji.skins &&
        emoji.skins.length > 0
      ) {
        return emoji.skins[0].src; // Return the src of the first skin
      }
    }
  }
  return null; // Return null if not found
};

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
  const [fromDate, setFromDate] = useState([]);
  const [fromTime, setFromTime] = useState([]);

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

    const now = new Date();
    setFromDate(formatDate(now));
    setFromTime(formatTime(now));

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
            <Dialog
              open={isUsernameDialogOpen}
              onClose={() => null}
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
                  autoComplete="off"
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
            {matches && (
              <>
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
                      {/* <ListItemText primary={`${msg.name}: ${msg.message}`} /> */}
                      {/* <ListItemText primary={renderMessage(msg.message)} /> */}
                      {/* <ListItemText>{`${fromDate}-${fromTime} ${msg.name}:  ${renderMessage(msg.message)}`}</ListItemText> */}
                      <ListItemText>
                        <span style={{ display: "flex" }}>
                          {`${fromDate}-${fromTime} ${msg.name}:  `}{" "}
                          &nbsp;&nbsp;
                          {renderMessage(msg.message)}
                        </span>
                      </ListItemText>
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
                    component="form" // Add this if you want to treat it like a form
                    onSubmit={sendMessage} // Ensuring that submit behavior (like pressing Enter) triggers sendMessage
                  >
                    {/* Text field */}
                    <TextField
                      variant="outlined"
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      autoComplete="off"
                      sx={{
                        input: {
                          color: backgroundColor,
                          backgroundColor:
                            getFontColorForBackground(backgroundColor),
                        },
                        flexGrow: 1,
                        mr: 1,
                      }}
                    />
                    {/* Emoji button */}
                    <Button
                      type="button"
                      variant="contained"
                      sx={{
                        maxHeight: "56px", // Match the TextField height
                        mr: 1, // Add margin right
                        color: backgroundColor,
                        backgroundColor:
                          getFontColorForBackground(backgroundColor),
                      }}
                      onClick={togglePicker}
                    >
                      😀
                    </Button>
                    {/* Send button */}
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        maxHeight: "56px", // Match the TextField height
                        color: backgroundColor,
                        backgroundColor:
                          getFontColorForBackground(backgroundColor),
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
                        {/* <EmojiPicker
                          // prettier-ignore
                          onEmojiClick={(emojiObject) =>
                      setMessage(
                        (previousMessage) => previousMessage + emojiObject.emoji
                      )
                    }
                          pickerStyle={{ width: "auto" }}
                        /> */}
                        <Picker
                          data={data}
                          custom={emojiList}
                          // prettier-ignore
                          onEmojiSelect={(emojiObject) => {
                            const a=true;
                            if (!emojiObject.native) {
                              console.log(emojiObject)
                              // For custom emojis, insert a unique identifier or shortcode
                              setMessage((prevMessage) => `${prevMessage}:custom_${emojiObject.id}:`);
                            } else {
                              // For standard emojis, use their native character
                              setMessage((prevMessage) => `${prevMessage}${emojiObject.native}`);
                            }
                          }}
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
              newSocket={socketRef.current}
            />
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default ChatApp;
