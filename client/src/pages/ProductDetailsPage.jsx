import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

import {
    Box,
    Button,
    Chip,
    Container,
    Grid,
    Paper,
    Typography,
} from "@mui/material";

function ProductDetailsPage() {
    const { slug } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const getProduct = async () => {
            try {
                const response = await api.get(`/products/${slug}`);
                setProduct(response.data.data);
            } catch (error) {
                setError("Product not found");
            } finally {
                setIsLoading(false);
            }
        };

        getProduct();
    }, [slug]);

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

                        <Typography sx={{ mb: 3 }}>
                            Stock: {product.stock}
                        </Typography>

                        <Button
                            variant="contained"
                            size="large"
                            disabled={product.stock === 0}
                            onClick={() => addToCart(product)}
                        >
                            Add to Cart
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}

export default ProductDetailsPage;