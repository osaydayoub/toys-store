import {
    Box,
    Button,
    Container,
    Divider,
    Typography,
} from "@mui/material";
import { useCart } from "../context/CartContext";

function CartPage() {
    const {
        cartItems,
        removeFromCart,
        clearCart,
        increaseQuantity,
        decreaseQuantity,
        totalItems,
        totalPrice,
    } = useCart();

    if (cartItems.length === 0) {
        return (
            <Container sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Cart
                </Typography>
                <Typography>Your cart is empty.</Typography>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Cart
            </Typography>

            {cartItems.map((item) => (
                <Box key={item._id} sx={{ mb: 2 }}>
                    <Typography variant="h6">{item.name}</Typography>
                    <Typography>Price: ₪{item.price}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                        <Button variant="outlined" onClick={() => decreaseQuantity(item._id)}>
                            -
                        </Button>

                        <Typography>{item.quantity}</Typography>

                        <Button variant="outlined" onClick={() => increaseQuantity(item._id)}>
                            +
                        </Button>
                    </Box>
                    <Typography>Total: ₪{item.price * item.quantity}</Typography>

                    <Button
                        color="error"
                        variant="outlined"
                        sx={{ mt: 1 }}
                        onClick={() => removeFromCart(item._id)}
                    >
                        Remove
                    </Button>

                    <Divider sx={{ mt: 2 }} />
                </Box>
            ))}

            <Typography variant="h6">Items: {totalItems}</Typography>
            <Typography variant="h6">
                Total Price: ₪{totalPrice.toFixed(2)}
            </Typography>

            <Button
                color="error"
                variant="contained"
                sx={{ mt: 2 }}
                onClick={clearCart}
            >
                Clear Cart
            </Button>
        </Container>
    );
}

export default CartPage;