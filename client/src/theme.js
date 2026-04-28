import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#D68A4A",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#6C8FA3",
      contrastText: "#ffffff",
    },
    background: {
      default: "#F7F3EF",
      paper: "#ffffff",
    },
    text: {
      primary: "#4A3F39",
      secondary: "#777777",
    },
  },
  typography: {
    fontFamily: ["Nunito", "Roboto", "Arial", "sans-serif"].join(","),
    h4: { fontWeight: 800 },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 700 },
    button: {
      textTransform: "none",
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 18,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          paddingInline: 20,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 22,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        },
      },
    },
  },
});

export default theme;