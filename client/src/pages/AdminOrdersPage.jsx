import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Chip,
    Container,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import api from "../services/api";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
const statusColors = {
    pending: "warning",
    processing: "info",
    shipped: "secondary",
    delivered: "success",
    cancelled: "error",
};

function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState("");
    const [feedback, setFeedback] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [searchOrderNumber, setSearchOrderNumber] = useState("");
    const [orderToCancel, setOrderToCancel] = useState(null);
    const { t, i18n } = useTranslation();

    const fetchOrders = async () => {
        try {
            const response = await api.get("/orders");
            setOrders(response.data.data);
        } catch {
            setError(t("adminOrdersPage.failedToLoad"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/status`, {
                status: newStatus,
            });

            setError("");
            setFeedback(t("adminOrdersPage.statusUpdated"));
            fetchOrders();
        } catch {
            setError(t("adminOrdersPage.failedToUpdate"));
        }
    };
    const confirmCancelOrder = async () => {
        if (!orderToCancel) return;

        await handleStatusChange(orderToCancel._id, "cancelled");

        setOrderToCancel(null);
    };
    const filteredOrders = orders.filter((order) => {
        const matchesStatus =
            selectedStatus === "all" || order.status === selectedStatus;

        const matchesOrderNumber = order.orderNumber
            .toLowerCase()
            .includes(searchOrderNumber.toLowerCase());

        return matchesStatus && matchesOrderNumber;
    });

    if (isLoading) {
        return (
            <Container sx={{ mt: 4 }}>
                <Typography>{t("adminOrdersPage.loading")}</Typography>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 4, mb: 6 }}>
            <Typography variant="h4" gutterBottom>
                {t("adminOrdersPage.title")}
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {feedback && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {feedback}
                </Alert>
            )}
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                <FormControl size="small" sx={{ minWidth: 220 }}>
                    <InputLabel>{t("adminOrdersPage.filterByStatus")}</InputLabel>
                    <Select
                        label={t("adminOrdersPage.filterByStatus")}
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <MenuItem value="all">
                            {t("adminOrdersPage.allOrders")}
                        </MenuItem>
                        {statuses.map((status) => (
                            <MenuItem key={status} value={status}>
                                {t(`orderStatus.${status}`)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    label={t("adminOrdersPage.searchByOrderNumber")}
                    size="small"
                    value={searchOrderNumber}
                    onChange={(e) => setSearchOrderNumber(e.target.value)}
                    sx={{ minWidth: 260 }}
                />
            </Box>

            {filteredOrders.length === 0 ? (
                <Typography color="text.secondary">
                    {t("adminOrdersPage.noOrders")}
                </Typography>
            ) : (
                <Stack spacing={3}>
                    {filteredOrders.map((order) => (
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
                                        {t("adminOrdersPage.orderNumber", {
                                            number: order.orderNumber,
                                        })}
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

                                    <Typography color="text.secondary">
                                        {t("adminOrdersPage.customer", {
                                            name: order.user?.name,
                                            email: order.user?.email,
                                        })}
                                    </Typography>

                                    <Typography color="text.secondary">
                                        {t("adminOrdersPage.phone", {
                                            phone: order.user?.phone,
                                        })}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                    <Chip
                                        label={t(`orderStatus.${order.status}`)}
                                        color={statusColors[order.status] || "default"}
                                    />

                                    <FormControl size="small" sx={{ minWidth: 160 }}>
                                        <InputLabel>{t("adminOrdersPage.status")}</InputLabel>
                                        <Select
                                            label={t("adminOrdersPage.status")}
                                            value={order.status}
                                            onChange={(e) => {
                                                const newStatus = e.target.value;

                                                if (newStatus === "cancelled") {
                                                    setOrderToCancel(order);
                                                } else {
                                                    handleStatusChange(order._id, newStatus);
                                                }
                                            }}
                                        >
                                            {statuses.map((status) => (
                                                <MenuItem key={status} value={status}>
                                                    {t(`orderStatus.${status}`)}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            {order.items.map((item) => (
                                <Box key={item.product} sx={{ mb: 1 }}>
                                    <Typography>
                                        {t("adminOrdersPage.itemQuantity", {
                                            name: item.name,
                                            quantity: item.quantity,
                                        })}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        {t("adminOrdersPage.priceEach", {
                                            price: item.price,
                                        })}
                                    </Typography>
                                </Box>
                            ))}

                            <Typography color="text.secondary">
                                {t("adminOrdersPage.shippingCost", {
                                    cost: order.shippingCost?.toFixed(2),
                                })}
                            </Typography>


                            <Divider sx={{ my: 2 }} />


                            <Typography variant="h6">
                                {t("adminOrdersPage.total", {
                                    total: order.totalPrice.toFixed(2),
                                })}
                            </Typography>

                            <Typography color="text.secondary">
                                {t("adminOrdersPage.shippingAddress", {
                                    region: t(`regions.${order.shippingAddress.region}`),
                                    city: order.shippingAddress.city,
                                    street: order.shippingAddress.street,
                                })}
                            </Typography>

                            <Typography color="text.secondary">
                                {t("adminOrdersPage.deliveryPhone", {
                                    phone: order.shippingAddress.phone,
                                })}
                            </Typography>
                            {order.deliveryNote && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography color="text.secondary">
                                        {t("adminOrdersPage.note", {
                                            note: order.deliveryNote,
                                        })}
                                    </Typography>
                                </>

                            )}
                        </Paper>
                    ))}
                </Stack>
            )}
            <Dialog
                open={Boolean(orderToCancel)}
                onClose={() => setOrderToCancel(null)}
            >
                <DialogTitle>{t("adminOrdersPage.cancelTitle")}</DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        {t("adminOrdersPage.cancelMessage")}{" "}
                        <strong>{orderToCancel?.orderNumber}</strong>?

                        <br />
                        <br />

                        {t("adminOrdersPage.restoreStock")}
                    </DialogContentText>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOrderToCancel(null)}>
                        {t("adminOrdersPage.keepOrder")}
                    </Button>

                    <Button
                        color="error"
                        variant="contained"
                        onClick={confirmCancelOrder}
                    >
                        {t("adminOrdersPage.cancelOrder")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default AdminOrdersPage;
