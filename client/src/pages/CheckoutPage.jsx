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
import { useCart } from "../context/CartContext";

const shippingCosts = {
  "Jerusalem District": 70,
  "Northern & Haifa District": 50,
  "Central & Tel Aviv District": 50,
  "Southern District": 70,
  "West Bank": 70,
};

function CheckoutPage() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      setSuccess("Order placed successfully!");

      // setTimeout(() => {
      //   navigate("/products");
      // }, 1500);
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
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography fontWeight={700}>{success}</Typography>

            {createdOrderNumber && (
              <Typography sx={{ mt: 1 }}>
                Order Number: {createdOrderNumber}
              </Typography>
            )}

            <Button
              component={Link}
              to="/my-orders"
              variant="contained"
              size="small"
              sx={{ mt: 2 }}
            >
              Go to My Orders
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
              Items: ₪{totalPrice.toFixed(2)}
            </Typography>

            <Typography sx={{ mb: 1 }}>
              Shipping: ₪{shippingCost.toFixed(2)}
            </Typography>

            <Typography variant="h6" sx={{ mb: 2 }}>
              Total: ₪{finalTotal.toFixed(2)}
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                required
                select
                margin="normal"
                label="Region"
                name="region"
                value={formData.region}
                onChange={handleChange}
              >
                {Object.entries(shippingCosts).map(([region, cost]) => (
                  <MenuItem key={region} value={region}>
                    {region} - ₪{cost}
                  </MenuItem>
                ))}
              </TextField>
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
              <TextField
                fullWidth
                multiline
                minRows={2}
                margin="normal"
                label="Delivery note (optional)"
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                placeholder="Example: Call before arriving"
              />
              <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                <Button
                  component={Link}
                  to="/cart"
                  variant="outlined"
                  fullWidth
                >
                  Back to Cart
                </Button>

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                >
                  {isLoading ? "Placing order..." : "Place Order"}
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