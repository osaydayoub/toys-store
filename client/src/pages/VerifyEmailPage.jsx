import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Container,
    Paper,
    Typography,
} from "@mui/material";
import api from "../services/api";
import logo from "../assets/logo.png";


function VerifyEmailPage() {
    const { token } = useParams();
    const hasVerified = useRef(false);
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("Verifying your email...");

    useEffect(() => {
        if (hasVerified.current) return;
        hasVerified.current = true;

        const verifyEmail = async () => {
            try {
                const response = await api.get(`/auth/verify-email/${token}`);

                setStatus("success");
                setMessage(response.data.message || "Email verified successfully.");
            } catch (error) {
                setStatus("error");
                setMessage(error.response?.data?.message || "Email verification failed.");
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
            <Paper sx={{ p: 4, borderRadius: 3 }}>
                <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Box
                        component="img"
                        src={logo}
                        alt="Baby Kids Toys"
                        sx={{
                            width: 140,
                            height: 140,
                            borderRadius: "50%",
                            objectFit: "cover",
                            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                            mb: 2,
                        }}
                    />
                </Box>

                <Typography variant="h4" gutterBottom textAlign="center">
                    Email Verification
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ mb: 3 }}
                >
                    Thank you for creating an account with Baby Kids Toys 🧸
                </Typography>

                <Alert
                    severity={
                        status === "success"
                            ? "success"
                            : status === "error"
                                ? "error"
                                : "info"
                    }
                    sx={{ mb: 3 }}
                >
                    {message}
                </Alert>

                <Button
                    fullWidth
                    component={Link}
                    to="/login"
                    variant="contained"
                    disabled={status === "loading"}
                >
                    Go to Login
                </Button>
            </Paper>
        </Container>
    );
}

export default VerifyEmailPage;