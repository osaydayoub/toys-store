import * as React from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { totalItems } = useCart();
  const { user, logout, isAdmin } = useAuth();

  const [anchorElNav, setAnchorElNav] = React.useState(null);

const pages = [
  { label: "Products", path: "/products", icon: <StorefrontIcon fontSize="small" /> },
  { label: `Cart (${totalItems})`, path: "/cart", icon: <ShoppingCartIcon fontSize="small" /> },
  ...(user ? [{ label: "My Orders", path: "/my-orders", icon: <ReceiptLongIcon fontSize="small" /> }] : []),
  ...(isAdmin
    ? [
        { label: "Admin Products", path: "/admin/products", icon: <AdminPanelSettingsIcon fontSize="small" /> },
        { label: "Admin Orders", path: "/admin/orders", icon: <ReceiptLongIcon fontSize="small" /> },
      ]
    : []),
];

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar position="static" elevation={0}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>

          {/* Logo */}
          <Box
            component={Link}
            to="/products"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              textDecoration: "none",
              color: "inherit",
              flexGrow: { xs: 1, md: 0 },
              mr: 2,
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
              }}
            />

            <Typography variant="h6">
              Baby Kids Toys
            </Typography>
          </Box>

          {/* Mobile Menu */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton size="large" onClick={handleOpenNavMenu} color="inherit">
              <MenuIcon />
            </IconButton>

            <Menu
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page.label}
                  component={Link}
                  to={page.path}
                  onClick={handleCloseNavMenu}
                >
                  {page.icon} <span style={{ marginLeft: 4 }}>{page.label}</span>
                
                </MenuItem>
              ))}
              {user ? (
                <MenuItem
                  onClick={() => {
                    logout();
                    handleCloseNavMenu();
                  }}
                >
                  <LogoutIcon fontSize="small" />
                  Logout
                </MenuItem>
              ) : (
                <MenuItem
                  component={Link}
                  to="/login"
                  onClick={handleCloseNavMenu}
                >
                  <LoginIcon fontSize="small" />
                  Login
                </MenuItem>
              )}
            </Menu>
          </Box>

          {/* Desktop Menu */}
          <Box
            sx={{
              ml: "auto",
              display: { xs: "none", md: "flex" },
            }}
          >
            {pages.map((page) => (
              <Button
                key={page.label}
                component={Link}
                to={page.path}
                color="inherit"
              >
       {page.icon} <span style={{ marginLeft: 4 }}>{page.label}</span>
              </Button>
            ))}
            {user ? (
              <Button color="inherit" onClick={logout}>
                <LogoutIcon fontSize="small" />
                Logout
              </Button>
            ) : (
              <Button component={Link} to="/login" color="inherit">
                <LoginIcon fontSize="small" />
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;