import { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useTranslation } from "react-i18next";

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
import ProductImageGallery from "../components/ProductImageGallery";

function ProductDetailsPage() {
    const { t } = useTranslation();
    const { slug } = useParams();
    const { addToCart, totalItems } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
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
            } catch {
                setError(t("productDetails.notFound"));
            } finally {
                setIsLoading(false);
            }
        };

        getProduct();
    }, [slug, t]);

    const handleAddToCart = () => {
        addToCart(product);
        setCartMessageOpen(true);
    };

    if (isLoading) return <Typography sx={{ p: 4 }}>{t("productDetails.loading")}</Typography>;
    if (error) return <Typography sx={{ p: 4 }}>{error}</Typography>;

    return (
        <Container sx={{ py: 4 }}>
            <Button
                component={Link}
                to={location.state?.fromProducts || "/products"}
                variant="outlined"
                sx={{ mb: 3 }}
            >
                {t("productDetails.backToProducts")}
            </Button>

            <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        {product.images?.[0] ? (
                            <ProductImageGallery images={product.images} productName={product.name} />
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
                                <Typography>{t("productDetails.noImage")}</Typography>
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
                            <Chip label={t(`categories.${product.category}`)} />
                            <Chip label={t(`ageRanges.${product.ageRange}`)} variant="outlined" />
                        </Box>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                            <Button
                                variant="contained"
                                size="large"
                                disabled={isOutOfStock}
                                onClick={handleAddToCart}
                            >
                                {isOutOfStock ? t("productDetails.outOfStock") : t("productDetails.addToCart")}
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
                    {t("productDetails.addedToCart")}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default ProductDetailsPage;
