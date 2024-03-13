import Box from "@mui/material/Box";
import tinycolor from "tinycolor2";
import { Tooltip } from "@mui/material";

const MembersDisplay = ({ members, backgroundColor }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column", // Organize content in a column
        alignItems: "center", // Align items in the center horizontally
        justifyContent: "center",
        backgroundColor: tinycolor(backgroundColor).darken(5).toString(),
        borderRadius: "10px",
        padding: "10px",
        margin: "10px 10px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center", // Center the members horizontally
          width: "100%", // Take full width to respect justifyContent
        }}
      >
        {members.map((member, index) => (
          <Box
            key={index}
            sx={{
              margin: "0 5px",
              "&::after": member.isNewMember
                ? {
                    content: '"+0"',
                    position: "absolute",
                    top: "-10px",
                    right: "-10px",
                    fontSize: "12px",
                    color: "black",
                  }
                : null,
            }}
          >
            <Tooltip title={member.name}>
              <Box
                sx={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "white",
                  borderRadius: "50%",
                  color: "black",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  position: "relative",
                }}
              >
                {member.name[0]}
              </Box>
            </Tooltip>
          </Box>
        ))}
      </Box>
      <Box sx={{ color: "white", fontSize: "14px", marginTop: "10px" }}>
        {members.length} member(s) in this pomo.
      </Box>
    </Box>
  );
};
export default MembersDisplay;
