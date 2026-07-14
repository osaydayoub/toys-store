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
import { useTranslation } from "react-i18next";
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
    const { t, i18n } = useTranslation();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get("/orders/my-orders");
                setOrders(response.data.data);
            } catch (error) {
                setError(
                    error.response?.data?.message || t("myOrders.failedToLoad")
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [t]);

    if (isLoading) {
        return (
            <Container sx={{ mt: 4 }}>
                <Typography>{t("myOrders.loading")}</Typography>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 4, mb: 6 }}>
            <Typography variant="h4" gutterBottom>
                {t("myOrders.title")}
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {!error && orders.length === 0 && (
                <Typography color="text.secondary">
                    {t("myOrders.noOrders")}
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
                                    {t("myOrders.orderNumber", { number: order.orderNumber })}
                                </Typography>

                                <Typography color="text.secondary">
                                    {new Date(order.createdAt).toLocaleString(i18n.language, {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </Typography>
                            </Box>

                            <Chip
                                label={t(`orderStatus.${order.status}`)}
                                color={statusColors[order.status] || "default"}
                            />
                        </Box>

                        <Divider sx={{ mb: 2 }} />
                        {order.status === "cancelled" ? (
                            <Typography color="error" sx={{ mb: 2 }}>
                                {t("myOrders.cancelled")}
                            </Typography>
                        ) : (
                            <Stepper
                                activeStep={getActiveStep(order.status)}
                                alternativeLabel
                                sx={{ mb: 3 }}
                            >
                                {orderSteps.map((step) => (
                                    <Step key={step}>
                                        <StepLabel>{t(`orderStatus.${step}`)}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                        )}

                        {order.items.map((item) => (
                            <Box key={item.product} sx={{ mb: 1 }}>
                                <Typography>
                                    {t("myOrders.itemQuantity", {
                                        name: item.name,
                                        quantity: item.quantity,
                                    })}
                                </Typography>
                                <Typography color="text.secondary">
                                    <Typography color="text.secondary">
                                        {t("myOrders.priceEach", { price: item.price })}
                                    </Typography>
                                </Typography>
                            </Box>
                        ))}
                        <Typography color="text.secondary">
                            {t("myOrders.shippingCost", {
                                cost: order.shippingCost?.toFixed(2),
                            })}
                        </Typography>

                        <Divider sx={{ my: 2 }} />


                        <Typography variant="h6">
                            {t("myOrders.total", {
                                total: order.totalPrice.toFixed(2),
                            })}
                        </Typography>
                        <Typography color="text.secondary">
                            {t("myOrders.shippingAddress", {
                                region: t(`regions.${order.shippingAddress.region}`),
                                city: order.shippingAddress.city,
                                street: order.shippingAddress.street,
                            })}
                        </Typography>

                        {order.deliveryNote && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography color="text.secondary">
                                    {t("myOrders.note", { note: order.deliveryNote })}
                                </Typography>
                            </>

                        )}
                    </Paper>
                ))}
            </Stack>
        </Container>
    );
}

export default MyOrdersPage;