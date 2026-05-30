import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import {
    Box,
    Button,
    Chip,
    Container,
    Grid,
    Paper,
    Snackbar,
    Alert,
    Typography,
    Stack,
    Badge,
    IconButton,
} from "@mui/material";

function ProductDetailsPage() {
    const { slug } = useParams();
    const { addToCart, totalItems } = useCart();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOutOfStock, setIsOutOfStock] = useState(false);
    const [error, setError] = useState("");
    const [cartMessageOpen, setCartMessageOpen] = useState(false);

    useEffect(() => {
        const getProduct = async () => {
            try {
                const response = await api.get(`/products/${slug}`);
                setProduct(response.data.data);
                setIsOutOfStock(response.data.data.stock === 0);
            } catch (error) {
                setError("Product not found");
            } finally {
                setIsLoading(false);
            }
        };

        getProduct();
    }, [slug]);

    const handleAddToCart = () => {
        addToCart(product);
        setCartMessageOpen(true);
    };

    if (isLoading) return <Typography sx={{ p: 4 }}>Loading product...</Typography>;
    if (error) return <Typography sx={{ p: 4 }}>{error}</Typography>;

    return (
        <Container sx={{ py: 4 }}>
            <Button component={Link} to="/products" variant="outlined" sx={{ mb: 3 }}>
                Back to products
            </Button>

            <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        {product.images?.[0] ? (
                            <Box
                                component="img"
                                src={product.images[0]}
                                alt={product.name}
                                sx={{
                                    width: "100%",
                                    maxHeight: 420,
                                    objectFit: "cover",
                                    borderRadius: 2,
                                    backgroundColor: "#f5f5f5",
                                }}
                            />
                        ) : (
                            <Box
                                sx={{
                                    height: 300,
                                    borderRadius: 2,
                                    backgroundColor: "#f5f5f5",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Typography>No image available</Typography>
                            </Box>
                        )}
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="h4" gutterBottom>
                            {product.name}
                        </Typography>

                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                            {product.description}
                        </Typography>

                        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                            ₪{product.price}
                        </Typography>

                        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                            <Chip label={product.category} />
                            <Chip label={product.ageRange} variant="outlined" />
                        </Box>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                            <Button
                                variant="contained"
                                size="large"
                                disabled={isOutOfStock}
                                onClick={handleAddToCart}
                            >
                                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                            </Button>


                            <IconButton
                                color="primary"
                                disabled={totalItems === 0}
                                onClick={() => navigate("/cart")}
                            >
                                <Badge badgeContent={totalItems} color="secondary">
                                    <ShoppingCartIcon />
                                </Badge>
                            </IconButton>

                        </Stack>
                    </Grid>
                </Grid>
            </Paper>
            <Snackbar
                open={cartMessageOpen}
                autoHideDuration={3000}
                onClose={() => setCartMessageOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    severity="success"
                    onClose={() => setCartMessageOpen(false)}
                >
                    Product added to cart
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default ProductDetailsPage;