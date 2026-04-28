import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import logo from "../assets/logo.png";

function Navbar() {
  const { totalItems } = useCart();

  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Toolbar>
        <Box
          component={Link}
          to="/products"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            textDecoration: "none",
            color: "inherit",
            flexGrow: 1,
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="Baby Kids Toys"
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              objectFit: "cover",
              backgroundColor: "white",
            }}
          />

          <Typography variant="h6">Baby Kids Toys</Typography>
        </Box>

        <Button component={Link} to="/products" color="inherit">
          Products
        </Button>

        <Button component={Link} to="/cart" color="inherit">
          Cart ({totalItems})
        </Button>

        <Button component={Link} to="/admin/products" color="inherit">
          Admin
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;