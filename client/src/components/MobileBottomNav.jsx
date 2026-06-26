import { Paper, BottomNavigation, BottomNavigationAction, Badge } from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();
  const { user } = useAuth();
  const { t } = useTranslation();

  const currentValue = location.pathname.startsWith("/cart")
    ? "/cart"
    : location.pathname.startsWith("/my-orders")
    ? "/my-orders"
    : "/products";

  return (
    <Paper
      elevation={8}
      sx={{
        display: { xs: "block", md: "none" },
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        pt: 1,
      }}
      
    >
      <BottomNavigation
        value={currentValue}
        onChange={(event, newValue) => {
          if (newValue === "/my-orders" && !user) {
            navigate("/login");
          } else {
            navigate(newValue);
          }
        }}
        showLabels
      >
        <BottomNavigationAction
          label={t("navbar.products")}
          value="/products"
          icon={<StorefrontIcon />}
        />

        <BottomNavigationAction
          label={t("navbar.cartShort")}
          value="/cart"
          icon={
            <Badge badgeContent={totalItems} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          }
        />

        <BottomNavigationAction
          label={t("navbar.myOrders")}
          value="/my-orders"
          icon={<ReceiptLongIcon />}
        />
      </BottomNavigation>
    </Paper>
  );
}

export default MobileBottomNav;