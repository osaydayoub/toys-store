import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import {
    Alert,
    Box,
    Button,
    Container,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const redirectPath = location.state?.from || "/products";
    const { login } = useAuth();
    const { t } = useTranslation();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const user = await login(formData.email, formData.password);
            navigate(redirectPath);
        } catch (error) {
            setError(error.response?.data?.message || t("login.loginFailed"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 6 }}>
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
                    {t("login.welcomeBack")}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ mb: 2 }}
                >
                    {t("login.subtitle")}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        required
                        margin="normal"
                        label={t("login.email")}
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                    />

                    <TextField
                        fullWidth
                        required
                        margin="normal"
                        label={t("login.password")}
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                    />

                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        sx={{ mt: 3 }}
                        disabled={isLoading}
                    >
                        {isLoading
                            ? t("login.loggingIn")
                            : t("login.login")}
                    </Button>
                </Box>
                <Typography textAlign="center" sx={{ mt: 2 }}>
                    {t("login.noAccount")} <Link to="/register">{t("login.register")}</Link>
                </Typography>
            </Paper>
        </Container>
    );
}

export default LoginPage;