import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Chip,
    Container,
    Divider,
    Paper,
    Stack,
    Step,
    Stepper,
    StepLabel,
    Typography,
} from "@mui/material";
import api from "../services/api";

const orderSteps = ["pending", "processing", "shipped", "delivered"];

const getActiveStep = (status) => {
    if (status === "cancelled") return -1;
    return orderSteps.indexOf(status);
};

const statusColors = {
    pending: "warning",
    processing: "info",
    shipped: "secondary",
    delivered: "success",
    cancelled: "error",
};

function MyOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get("/orders/my-orders");
                setOrders(response.data.data);
            } catch (error) {
                setError(error.response?.data?.message || "Failed to load orders");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (isLoading) {
        return (
            <Container sx={{ mt: 4 }}>
                <Typography>Loading orders...</Typography>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 4, mb: 6 }}>
            <Typography variant="h4" gutterBottom>
                My Orders
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {!error && orders.length === 0 && (
                <Typography color="text.secondary">
                    You have no orders yet.
                </Typography>
            )}

            <Stack spacing={3}>
                {orders.map((order) => (
                    <Paper key={order._id} sx={{ p: 3, borderRadius: 3 }}>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 2,
                                flexWrap: "wrap",
                                mb: 2,
                            }}
                        >
                            <Box>
                                <Typography variant="h6">
                                    Order #{order.orderNumber}
                                </Typography>

                                <Typography color="text.secondary">
                                    {new Date(order.createdAt).toLocaleString("en-GB", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </Typography>
                            </Box>

                            <Chip
                                label={order.status}
                                color={statusColors[order.status] || "default"}
                            />
                        </Box>

                        <Divider sx={{ mb: 2 }} />
                        {order.status === "cancelled" ? (
                            <Typography color="error" sx={{ mb: 2 }}>
                                This order was cancelled.
                            </Typography>
                        ) : (
                            <Stepper
                                activeStep={getActiveStep(order.status)}
                                alternativeLabel
                                sx={{ mb: 3 }}
                            >
                                {orderSteps.map((step) => (
                                    <Step key={step}>
                                        <StepLabel>{step}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                        )}

                        {order.items.map((item) => (
                            <Box key={item.product} sx={{ mb: 1 }}>
                                <Typography>
                                    {item.name} x {item.quantity}
                                </Typography>
                                <Typography color="text.secondary">
                                    ₪{item.price} each
                                </Typography>
                            </Box>
                        ))}

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="h6">
                            Total: ₪{order.totalPrice.toFixed(2)}
                        </Typography>

                        <Typography color="text.secondary">
                            Shipping: {order.shippingAddress.city},{" "}
                            {order.shippingAddress.street}
                        </Typography>
                    </Paper>
                ))}
            </Stack>
        </Container>
    );
}

export default MyOrdersPage;