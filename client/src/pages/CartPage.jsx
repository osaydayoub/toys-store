import {
    Box,
    Button,
    Container,
    Divider,
    Typography,
} from "@mui/material";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function CartPage() {
    const { t } = useTranslation();
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
                    {t("cart.title")}
                </Typography>
                <Typography>{t("cart.empty")}</Typography>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                {t("cart.title")}
            </Typography>

            {cartItems.map((item) => (
                <Box key={item._id} sx={{ mb: 2 }}>
                    <Typography variant="h6">{item.name}</Typography>
                    <Typography>{t("cart.price", { price: item.price })}</Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                        <Button variant="outlined" onClick={() => decreaseQuantity(item._id)}>
                            -
                        </Button>

                        <Typography>{item.quantity}</Typography>

                        <Button variant="outlined" onClick={() => increaseQuantity(item._id)}>
                            +
                        </Button>
                    </Box>
                    <Typography>  {t("cart.itemTotal", {
                        total: item.price * item.quantity,
                    })}</Typography>

                    <Button
                        color="error"
                        variant="outlined"
                        sx={{ mt: 1 }}
                        onClick={() => removeFromCart(item._id)}
                    >
                        {t("cart.remove")}
                    </Button>

                    <Divider sx={{ mt: 2 }} />
                </Box>
            ))}

            <Typography variant="h6"> {t("cart.itemsCount", { count: totalItems })}</Typography>
            <Typography variant="h6">
                {t("cart.totalPrice", { total: totalPrice.toFixed(2) })}
            </Typography>

            <Button
                color="error"
                variant="contained"
                sx={{ mt: 2 }}
                onClick={clearCart}
            >
                {t("cart.clearCart")}
            </Button>
            <Button
                component={Link}
                to="/checkout"
                variant="contained"
                sx={{ mt: 2, mr: 2 }}
            >
                {t("cart.checkout")}
            </Button>
        </Container>
    );
}

export default CartPage;