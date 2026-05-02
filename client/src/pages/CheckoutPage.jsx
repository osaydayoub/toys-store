import { useState } from "react";
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Later this will call backend order API
    console.log({
      items: cartItems,
      shippingAddress: formData,
      totalPrice,
    });

    clearCart();
    setSuccess("Order placed successfully!");
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

              <Button fullWidth type="submit" variant="contained" sx={{ mt: 3 }}>
                Place Order
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default CheckoutPage;