import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";

const shippingCosts = {
  "Jerusalem District": 70,
  "Northern & Haifa District": 50,
  "Central District": 50,
  "Tel Aviv District": 70,
  "Southern District": 70,
  "West Bank": 70,
};

function CheckoutPage() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    region: "",
    city: "",
    street: "",
    phone: "",
  });
  const [deliveryNote, setDeliveryNote] = useState("");

  const [success, setSuccess] = useState("");
  const [createdOrderNumber, setCreatedOrderNumber] = useState("");
  const shippingCost = formData.region ? shippingCosts[formData.region] : 0;
  const finalTotal = totalPrice + shippingCost;
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const orderData = {
        items: cartItems,
        shippingAddress: formData,
        deliveryNote: deliveryNote,
      };

      const response = await api.post("/orders", orderData);
      setCreatedOrderNumber(response.data.data.orderNumber);

      clearCart();
      setSuccess(t("checkout.orderPlaced"));

      // setTimeout(() => {
      //   navigate("/products");
      // }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || t("checkout.failedToPlaceOrder"));
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0 && !success) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4">{t("checkout.title")}</Typography>
        <Typography>{t("checkout.emptyCart")}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t("checkout.title")}
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography fontWeight={700}>{success}</Typography>

            {createdOrderNumber && (
              <Typography sx={{ mt: 1 }}>
                <Typography sx={{ mt: 1 }}>
                  {t("checkout.orderNumber", { number: createdOrderNumber })}
                </Typography>
              </Typography>
            )}

            <Button
              component={Link}
              to="/my-orders"
              variant="contained"
              size="small"
              sx={{ mt: 2 }}
            >
              {t("checkout.goToMyOrders")}
            </Button>
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!success && (
          <>
            <Typography sx={{ mb: 1 }}>
              {t("checkout.itemsTotal", { total: totalPrice.toFixed(2) })}
            </Typography>

            <Typography sx={{ mb: 1 }}>
              {t("checkout.shipping", { cost: shippingCost.toFixed(2) })}
            </Typography>

            <Typography variant="h6" sx={{ mb: 2 }}>
              {t("checkout.total", { total: finalTotal.toFixed(2) })}
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                required
                select
                margin="normal"
                label={t("checkout.region")}
                name="region"
                value={formData.region}
                onChange={handleChange}
              >
                {Object.entries(shippingCosts).map(([region, cost]) => (
                  <MenuItem key={region} value={region}>
                    {t(`regions.${region}`)} - ₪{cost}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                required
                margin="normal"
                label={t("checkout.city")}
                name="city"
                value={formData.city}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                required
                margin="normal"
                label={t("checkout.street")}
                name="street"
                value={formData.street}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                required
                margin="normal"
                label={t("checkout.phone")}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                multiline
                minRows={2}
                margin="normal"
                label={t("checkout.deliveryNote")}
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                placeholder={t("checkout.deliveryNotePlaceholder")}
              />
              <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                <Button
                  component={Link}
                  to="/cart"
                  variant="outlined"
                  fullWidth
                >
                  {t("checkout.backToCart")}
                </Button>

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                >
                  {isLoading
                    ? t("checkout.placingOrder")
                    : t("checkout.placeOrder")}
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default CheckoutPage;