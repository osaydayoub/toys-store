import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useCart } from "../context/CartContext";

function CheckoutPage() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    city: "",
    street: "",
    phone: "",
  });

  const [success, setSuccess] = useState("");

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
        totalPrice,
      };

      await api.post("/orders", orderData);

      clearCart();
      setSuccess("Order placed successfully!");

      setTimeout(() => {
        navigate("/products");
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0 && !success) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4">Checkout</Typography>
        <Typography>Your cart is empty.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom>
          Checkout
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!success && (
          <>
            <Typography sx={{ mb: 2 }}>
              Total: ₪{totalPrice.toFixed(2)}
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                required
                margin="normal"
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                required
                margin="normal"
                label="Street"
                name="street"
                value={formData.street}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                required
                margin="normal"
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                sx={{ mt: 3 }}
                disabled={isLoading}
              >
                {isLoading ? "Placing order..." : "Place Order"}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default CheckoutPage;