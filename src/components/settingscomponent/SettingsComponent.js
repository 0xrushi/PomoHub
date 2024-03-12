import React, { useState } from "react";
import { IconButton, Popover, Button } from "@mui/material";
import SettingsApplicationsRoundedIcon from "@mui/icons-material/SettingsApplicationsRounded";
import { SketchPicker } from "react-color"; // Make sure to import the SketchPicker

const SettingsComponent = ({
  changeBackgroundColor, // Ensure this function is implemented and passed as a prop
  changeBackgroundImage, // Ensure this function is implemented and passed as a prop
  handleToggleGrid, // Ensure this function is implemented and passed as a prop
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [color, setColor] = useState("#fff");

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setShowColorPicker(false); // Close color picker when closing settings
  };

  const handleColorChange = (color) => {
    setColor(color.hex);
    changeBackgroundColor(color.hex); // Now calling the prop function to change the color
  };

  const toggleColorPicker = () => {
    setShowColorPicker(!showColorPicker);
  };

  const open = Boolean(anchorEl);
  const id = open ? "settings-popover" : undefined;

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          position: "fixed",
          top: 8, // Adjust the position as needed
          right: 8, // Adjust the position as needed
          zIndex: 1100, // Ensure it's above other content
          color: "primary.main", // Use theme's primary color
        }}
      >
        <SettingsApplicationsRoundedIcon />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Button onClick={toggleColorPicker}>Change Background Color</Button>
        {showColorPicker && (
          <SketchPicker color={color} onChangeComplete={handleColorChange} />
        )}
        {/* <Button
          onClick={() => {
            changeBackgroundImage(); // Assuming this is properly implemented
            handleClose();
          }}
        >
          Pick Background Image
        </Button> */}
        <Button
          onClick={() => {
            handleToggleGrid(); // Assuming this is properly implemented
            handleClose();
          }}
        >
          Cuckoo Mode
        </Button>
      </Popover>
    </>
  );
};

export default SettingsComponent;
