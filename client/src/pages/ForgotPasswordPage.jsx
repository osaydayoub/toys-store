import { useEffect, useState } from "react";
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

function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return undefined;

    const timer = window.setInterval(() => {
      setCountdown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [countdown]);

  const sendResetCode = async () => {
    if (!email.trim() || isLoading || countdown > 0) return;

    try {
      setIsLoading(true);
      setError("");
      await api.post("/auth/forgot-password", { email });
      setStep("reset");
      setCountdown(60);
      setSuccess(t("forgotPassword.codeSent"));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          t("forgotPassword.sendFailed")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestSubmit = async (event) => {
    event.preventDefault();
    await sendResetCode();
  };

  const handleResetSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError(t("forgotPassword.passwordsDoNotMatch"));
      return;
    }

    try {
      setIsLoading(true);
      await api.post("/auth/reset-password", {
        email,
        code,
        password,
      });
      setSuccess(t("forgotPassword.resetSuccess"));
      window.setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          t("forgotPassword.resetFailed")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
      <Paper sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box
            component="img"
            src={logo}
            alt="Baby Kids Toys"
            sx={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              objectFit: "cover",
              boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
              mb: 2,
            }}
          />
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {t("forgotPassword.title")}
          </Typography>
          <Typography color="text.secondary">
            {step === "request"
              ? t("forgotPassword.requestInstructions")
              : t("forgotPassword.resetInstructions", { email })}
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {step === "request" ? (
          <Box component="form" onSubmit={handleRequestSubmit}>
            <TextField
              fullWidth
              required
              label={t("forgotPassword.email")}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{ mt: 3 }}
            >
              {isLoading
                ? t("forgotPassword.sending")
                : t("forgotPassword.sendCode")}
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleResetSubmit}>
            <TextField
              fullWidth
              required
              label={t("forgotPassword.code")}
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              inputProps={{
                dir: "ltr",
                inputMode: "numeric",
                maxLength: 6,
                autoComplete: "one-time-code",
                style: { textAlign: "center", letterSpacing: "0.5rem" },
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              required
              label={t("forgotPassword.newPassword")}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              inputProps={{ minLength: 6 }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              required
              label={t("forgotPassword.confirmPassword")}
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              inputProps={{ minLength: 6 }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={isLoading || code.length !== 6}
              sx={{ mt: 3 }}
            >
              {isLoading
                ? t("forgotPassword.resetting")
                : t("forgotPassword.resetPassword")}
            </Button>
            <Button
              fullWidth
              type="button"
              onClick={sendResetCode}
              disabled={isLoading || countdown > 0}
              sx={{ mt: 1 }}
            >
              {countdown > 0
                ? t("forgotPassword.resendIn", { seconds: countdown })
                : t("forgotPassword.resend")}
            </Button>
            <Button
              fullWidth
              type="button"
              onClick={() => {
                setStep("request");
                setCode("");
                setPassword("");
                setConfirmPassword("");
                setCountdown(0);
                setError("");
                setSuccess("");
              }}
            >
              {t("forgotPassword.changeEmail")}
            </Button>
          </Box>
        )}

        <Typography textAlign="center" sx={{ mt: 2 }}>
          <Link to="/login">{t("forgotPassword.backToLogin")}</Link>
        </Typography>
      </Paper>
    </Container>
  );
}

export default ForgotPasswordPage;
