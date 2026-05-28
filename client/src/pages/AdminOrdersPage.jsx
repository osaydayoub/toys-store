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
    Typography,
} from "@mui/material";
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

    const fetchOrders = async () => {
        try {
            const response = await api.get("/orders");
            setOrders(response.data.data);
        } catch (error) {
            setError(error.response?.data?.message || "Failed to load orders");
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

            setFeedback("Order status updated successfully");
            fetchOrders();
        } catch (error) {
            setError(error.response?.data?.message || "Failed to update status");
        }
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
                <Typography>Loading orders...</Typography>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 4, mb: 6 }}>
            <Typography variant="h4" gutterBottom>
                Admin Orders
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
                    <InputLabel>Filter by Status</InputLabel>
                    <Select
                        label="Filter by Status"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <MenuItem value="all">All Orders</MenuItem>
                        {statuses.map((status) => (
                            <MenuItem key={status} value={status}>
                                {status}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    label="Search by Order Number"
                    size="small"
                    value={searchOrderNumber}
                    onChange={(e) => setSearchOrderNumber(e.target.value)}
                    sx={{ minWidth: 260 }}
                />
            </Box>

            {filteredOrders.length === 0 ? (
                <Typography color="text.secondary">No orders yet.</Typography>
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
                                        Order #{order.orderNumber}
                                    </Typography>

                                    <Typography color="text.secondary">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </Typography>

                                    <Typography color="text.secondary">
                                        Customer: {order.user?.name} | {order.user?.email}
                                    </Typography>

                                    <Typography color="text.secondary">
                                        Phone: {order.user?.phone}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                    <Chip
                                        label={order.status}
                                        color={statusColors[order.status] || "default"}
                                    />

                                    <FormControl size="small" sx={{ minWidth: 160 }}>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            label="Status"
                                            value={order.status}
                                            onChange={(e) =>
                                                handleStatusChange(order._id, e.target.value)
                                            }
                                        >
                                            {statuses.map((status) => (
                                                <MenuItem key={status} value={status}>
                                                    {status}
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
                                        {item.name} × {item.quantity}
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

                            <Typography color="text.secondary">
                                Delivery Phone: {order.shippingAddress.phone}
                            </Typography>
                        </Paper>
                    ))}
                </Stack>
            )}
        </Container>
    );
}

export default AdminOrdersPage;