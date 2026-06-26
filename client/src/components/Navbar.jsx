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
import LanguageIcon from "@mui/icons-material/Language";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

function Navbar() {
  const { totalItems } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElLang, setAnchorElLang] = React.useState(null);
  const { t, i18n } = useTranslation();

  const pages = [
    {
      key: "products",
      label: t("navbar.products"),
      path: "/products",
      icon: <StorefrontIcon fontSize="small" />,
    },
    {
      key: "cart",
      label: t("navbar.cart", { count: totalItems }),
      path: "/cart",
      icon: <ShoppingCartIcon fontSize="small" />,
    },
    ...(user
      ? [
        {
          key: "myOrders",
          label: t("navbar.myOrders"),
          path: "/my-orders",
          icon: <ReceiptLongIcon fontSize="small" />,
        },
      ]
      : []),
    ...(isAdmin
      ? [
        {
          key: "adminProducts",
          label: t("navbar.adminProducts"),
          path: "/admin/products",
          icon: <AdminPanelSettingsIcon fontSize="small" />,
        },
        {
          key: "adminOrders",
          label: t("navbar.adminOrders"),
          path: "/admin/orders",
          icon: <ReceiptLongIcon fontSize="small" />,
        },
      ]
      : []),
  ];

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const currentLanguage =
    {
      en: "English",
      ar: "العربية",
      he: "עברית",
    }[i18n.language] || "English";

  const handleOpenLangMenu = (event) => {
    setAnchorElLang(event.currentTarget);
  };

  const handleCloseLangMenu = () => {
    setAnchorElLang(null);
  };

  const handleChangeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    handleCloseLangMenu();
    handleCloseNavMenu();
  };

  return (
    <AppBar position="static" elevation={0}>
      <Container maxWidth="xl">
        <Menu
          anchorEl={anchorElLang}
          open={Boolean(anchorElLang)}
          onClose={handleCloseLangMenu}
        >
          <MenuItem onClick={() => handleChangeLanguage("en")}>English</MenuItem>
          <MenuItem onClick={() => handleChangeLanguage("ar")}>العربية</MenuItem>
          <MenuItem onClick={() => handleChangeLanguage("he")}>עברית</MenuItem>
        </Menu>
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
              {t("navbar.brand")}
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
              <MenuItem onClick={handleOpenLangMenu}>
                <LanguageIcon fontSize="small" />
                <span style={{ marginLeft: 4 }}>{currentLanguage}</span>
              </MenuItem>
              {user ? (
                <MenuItem
                  onClick={() => {
                    logout();
                    handleCloseNavMenu();
                  }}
                >
                  <LogoutIcon fontSize="small" />
                  {t("navbar.logout")}
                </MenuItem>
              ) : (
                <MenuItem
                  component={Link}
                  to="/login"
                  onClick={handleCloseNavMenu}
                >
                  <LoginIcon fontSize="small" />
                  {t("navbar.login")}
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
            <Button
              color="inherit"
              onClick={handleOpenLangMenu}
              startIcon={<LanguageIcon />}
              endIcon={<ArrowDropDownIcon />}
            >
              {currentLanguage}
            </Button>
            {user ? (
              <Button color="inherit" onClick={logout}>
                <LogoutIcon fontSize="small" />
                {t("navbar.logout")}
              </Button>
            ) : (
              <Button component={Link} to="/login" color="inherit">
                <LoginIcon fontSize="small" />
                {t("navbar.login")}
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;