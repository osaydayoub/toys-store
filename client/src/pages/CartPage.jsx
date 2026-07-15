import { useState } from "react";
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Typography,
} from "@mui/material";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function CartPage() {
    const { t } = useTranslation();
    const [productToRemove, setProductToRemove] = useState(null);
    const [clearCartDialogOpen, setClearCartDialogOpen] = useState(false);

    const {
        cartItems,
        removeFromCart,
        clearCart,
        increaseQuantity,
        decreaseQuantity,
        totalItems,
        totalPrice,
    } = useCart();

    const requestRemoveProduct = (product) => {
        setProductToRemove(product);
    };

    const handleDecreaseQuantity = (product) => {
        if (product.quantity === 1) {
            requestRemoveProduct(product);
            return;
        }

        decreaseQuantity(product._id);
    };

    const confirmRemoveProduct = () => {
        if (!productToRemove) return;

        const productId = productToRemove._id;
        setProductToRemove(null);
        removeFromCart(productId);
    };

    const confirmClearCart = () => {
        setClearCartDialogOpen(false);
        clearCart();
    };

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
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: {
                                xs: "column",
                                sm: "row",
                            },
                            alignItems: {
                                xs: "center",
                                sm: "flex-start",
                            },
                            justifyContent: {
                                xs: "center",
                                sm: "flex-start",
                            },
                            gap: 2,
                            textAlign: {
                                xs: "center",
                                sm: "start",
                            },
                        }}
                    >


                        {/* Product information */}
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: {
                                    xs: "center",
                                    sm: "flex-start",
                                },
                            }}
                        >
                            <Typography variant="h6">{item.name}</Typography>

                            <Typography>
                                {t("cart.price", { price: item.price })}
                            </Typography>

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: {
                                        xs: "center",
                                        sm: "flex-start",
                                    },
                                    gap: 1,
                                    mt: 1,
                                }}
                            >
                                <Button
                                    variant="outlined"
                                    onClick={() => handleDecreaseQuantity(item)}
                                >
                                    -
                                </Button>

                                <Typography>{item.quantity}</Typography>

                                <Button
                                    variant="outlined"
                                    onClick={() => increaseQuantity(item._id)}
                                >
                                    +
                                </Button>
                            </Box>

                            <Typography sx={{ mt: 1 }}>
                                {t("cart.itemTotal", {
                                    total: item.price * item.quantity,
                                })}
                            </Typography>

                            <Button
                                color="error"
                                variant="outlined"
                                sx={{ mt: 1 }}
                                onClick={() => requestRemoveProduct(item)}
                            >
                                {t("cart.remove")}
                            </Button>
                        </Box>
                        {/* Product image */}
                        <Box
                            component={Link}
                            to={`/products/${item.slug}`}
                            sx={{
                                display: "block",
                                flexShrink: 0,
                                textDecoration: "none",
                            }}
                        >
                            <Box
                                component="img"
                                src={item.images?.[0]}
                                alt={item.name}
                                sx={{
                                    width: { xs: 130, sm: 110 },
                                    height: { xs: 130, sm: 110 },
                                    objectFit: "cover",
                                    borderRadius: 2,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    display: "block",
                                }}
                            />
                        </Box>
                    </Box>


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
                onClick={() => setClearCartDialogOpen(true)}
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

            <Dialog
                open={Boolean(productToRemove)}
                onClose={() => setProductToRemove(null)}
            >
                <DialogTitle>{t("cart.removeProductTitle")}</DialogTitle>

                <DialogContent>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 2,
                            py: 1,
                        }}
                    >
                        <Box
                            component="img"
                            src={productToRemove?.images?.[0]}
                            alt={productToRemove?.name}
                            sx={{
                                width: 120,
                                height: 120,
                                objectFit: "cover",
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: "divider",
                            }}
                        />

                        <DialogContentText textAlign="center">
                            {t("cart.removeProductMessage", {
                                name: productToRemove?.name,
                            })}
                        </DialogContentText>
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setProductToRemove(null)}>
                        {t("cart.cancel")}
                    </Button>

                    <Button
                        color="error"
                        variant="contained"
                        onClick={confirmRemoveProduct}
                    >
                        {t("cart.confirmRemove")}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={clearCartDialogOpen}
                onClose={() => setClearCartDialogOpen(false)}
            >
                <DialogTitle>{t("cart.clearCartTitle")}</DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        {t("cart.clearCartMessage")}
                    </DialogContentText>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setClearCartDialogOpen(false)}>
                        {t("cart.cancel")}
                    </Button>

                    <Button
                        color="error"
                        variant="contained"
                        onClick={confirmClearCart}
                    >
                        {t("cart.confirmClearCart")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default CartPage;
