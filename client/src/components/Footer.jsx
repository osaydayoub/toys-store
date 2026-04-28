import { Box, Container, Typography } from "@mui/material";
import logo from "../assets/logo.png";

function Footer() {
  return (
    <Box
      sx={{
        mt: 6,
        py: 4,
        backgroundColor: "#F7F3EF",
        borderTop: "1px solid #eee",
      }}
    >
      <Container sx={{ textAlign: "center" }}>
        <Box
          component="img"
          src={logo}
          alt="Baby Kids Toys"
          sx={{
            width: 100,
            mb: 2,
            borderRadius: "50%",
          }}
        />

        <Typography variant="h6" sx={{ mb: 1 }}>
          Baby Kids Toys
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Safe, fun and educational toys for your little ones ❤️
        </Typography>

        <Typography variant="caption" display="block" sx={{ mt: 2 }}>
          © {new Date().getFullYear()} Baby Kids Toys
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;