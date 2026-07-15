import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import logo from "../assets/logo.png";


function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
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
      await api.post("/auth/register", formData);
      const verificationEmail = formData.email.trim().toLowerCase();

      sessionStorage.setItem("verificationEmail", verificationEmail);
      navigate("/verify-email", {
        state: {
          email: verificationEmail,
          justRegistered: true,
        },
      });
    } catch (error) {
      setError(error.response?.data?.message || t("register.registrationFailed"));
    } finally {
      setIsLoading(false);
    }
  };

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
          {t("register.createAccount")}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 2 }}
        >
          {t("register.subtitle")}
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
            label={t("register.name")}
            name="name"
            value={formData.name}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            required
            margin="normal"
            label={t("register.email")}
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            required
            margin="normal"
            label={t("register.phone")}
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            required
            margin="normal"
            label={t("register.password")}
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
              ? t("register.creatingAccount")
              : t("register.register")}
          </Button>
        </Box>

        <Typography textAlign="center" sx={{ mt: 2 }}>
          {t("register.haveAccount")}{" "}
          <Link to="/login">{t("register.login")}</Link>
        </Typography>
      </Paper>
    </Container>
  );
}

export default RegisterPage;
