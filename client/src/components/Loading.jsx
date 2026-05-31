import { Box, LinearProgress, Typography } from "@mui/material";
import logo from "../assets/logo.png";

function Loading({ text = "Loading..." }) {
  return (
    <Box
      sx={{
        minHeight: "50vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Box
        component="img"
        src={logo}
        alt="Baby Kids Toys"
        sx={{
          width: 140,
          height: 140,
          borderRadius: "50%",
          objectFit: "cover",

          animation: "swing 1.5s ease-in-out infinite",

          "@keyframes swing": {
            "0%": {
              transform: "rotate(-15deg)",
            },
            "50%": {
              transform: "rotate(15deg)",
            },
            "100%": {
              transform: "rotate(-15deg)",
            },
          },
        }}
      />

      <Typography
        variant="h6"
        color="text.secondary"
        sx={{
          mt: 3,
          mb: 2,
          fontWeight: 500,
          textAlign: "center",
        }}
      >
        {text}
      </Typography>

      <Box sx={{ width: 220 }}>
        <LinearProgress  color="secondary"/>
      </Box>
    </Box>
  );
}

export default Loading;