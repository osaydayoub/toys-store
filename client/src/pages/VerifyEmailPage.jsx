import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import logo from "../assets/logo.png";

const CODE_LENGTH = 6;

const maskEmail = (email) => {
    const [name, domain] = email.split("@");
    if (!name || !domain) return email;

    const visibleName = name.slice(0, Math.min(2, name.length));
    return `${visibleName}${"*".repeat(Math.max(3, name.length - visibleName.length))}@${domain}`;
};

function VerifyEmailPage() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { completeAuthentication } = useAuth();
    const inputRefs = useRef([]);

    const email =
        location.state?.email || sessionStorage.getItem("verificationEmail") || "";

    const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(
        location.state?.justRegistered ? 60 : 0
    );

    useEffect(() => {
        if (countdown <= 0) return undefined;

        const timer = window.setInterval(() => {
            setCountdown((current) => Math.max(0, current - 1));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [countdown]);

    const verifyCode = async (code) => {
        if (!email || code.length !== CODE_LENGTH || isVerifying) return;

        try {
            setIsVerifying(true);
            setError("");

            const response = await api.post("/auth/verify-email", {
                email,
                code,
            });

            completeAuthentication(response.data.data);
            sessionStorage.removeItem("verificationEmail");
            setSuccess(t("verifyEmail.success"));

            window.setTimeout(() => navigate("/products", { replace: true }), 1000);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message || t("verifyEmail.failed")
            );
            setDigits(Array(CODE_LENGTH).fill(""));
            inputRefs.current[0]?.focus();
        } finally {
            setIsVerifying(false);
        }
    };

    const handleDigitChange = (index, value) => {
        const digit = value.replace(/\D/g, "").slice(-1);
        const nextDigits = [...digits];
        nextDigits[index] = digit;
        setDigits(nextDigits);
        setError("");

        if (digit && index < CODE_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }

    };

    const handleKeyDown = (index, event) => {
        if (event.key === "Backspace" && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (event) => {
        event.preventDefault();
        const pastedCode = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, CODE_LENGTH);

        if (!pastedCode) return;

        const nextDigits = Array(CODE_LENGTH)
            .fill("")
            .map((_, index) => pastedCode[index] || "");

        setDigits(nextDigits);
        inputRefs.current[Math.min(pastedCode.length, CODE_LENGTH) - 1]?.focus();

    };

    const resendCode = async () => {
        if (!email || countdown > 0 || isResending) return;

        try {
            setIsResending(true);
            setError("");
            await api.post("/auth/resend-verification-code", { email });
            setDigits(Array(CODE_LENGTH).fill(""));
            setCountdown(60);
            setSuccess(t("verifyEmail.codeResent"));
            inputRefs.current[0]?.focus();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message || t("verifyEmail.resendFailed")
            );
        } finally {
            setIsResending(false);
        }
    };

    if (!email) {
        return (
            <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    {t("verifyEmail.missingEmail")}
                </Alert>
                <Button component={Link} to="/register" variant="contained">
                    {t("verifyEmail.backToRegister")}
                </Button>
            </Container>
        );
    }

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
                        {t("verifyEmail.title")}
                    </Typography>

                    <Typography color="text.secondary">
                        {t("verifyEmail.instructions", {
                            email: maskEmail(email),
                        })}
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <Box
                    onPaste={handlePaste}
                    sx={{
                        display: "flex",
                        direction: "ltr",
                        justifyContent: "center",
                        gap: { xs: 0.75, sm: 1.25 },
                        mb: 3,
                    }}
                >
                    {digits.map((digit, index) => (
                        <TextField
                            key={index}
                            inputRef={(element) => {
                                inputRefs.current[index] = element;
                            }}
                            autoFocus={index === 0}
                            value={digit}
                            onChange={(event) =>
                                handleDigitChange(index, event.target.value)
                            }
                            onKeyDown={(event) => handleKeyDown(index, event)}
                            disabled={isVerifying || Boolean(success)}
                            inputProps={{
                                inputMode: "numeric",
                                maxLength: 1,
                                "aria-label": t("verifyEmail.digitLabel", {
                                    number: index + 1,
                                }),
                                style: {
                                    textAlign: "center",
                                    fontSize: "1.5rem",
                                    fontWeight: 700,
                                    padding: "12px 0",
                                },
                            }}
                            sx={{ width: { xs: 42, sm: 52 } }}
                        />
                    ))}
                </Box>

                <Button
                    fullWidth
                    variant="contained"
                    onClick={() => verifyCode(digits.join(""))}
                    disabled={
                        digits.join("").length !== CODE_LENGTH ||
                        isVerifying ||
                        Boolean(success)
                    }
                >
                    {isVerifying
                        ? t("verifyEmail.verifying")
                        : t("verifyEmail.verify")}
                </Button>

                <Box sx={{ mt: 2, textAlign: "center" }}>
                    <Button
                        onClick={resendCode}
                        disabled={countdown > 0 || isResending || Boolean(success)}
                    >
                        {countdown > 0
                            ? t("verifyEmail.resendIn", { seconds: countdown })
                            : isResending
                                ? t("verifyEmail.resending")
                                : t("verifyEmail.resend")}
                    </Button>

                    <Typography variant="body2" color="text.secondary">
                        {t("verifyEmail.spamReminder")}
                    </Typography>
                </Box>

                <Typography textAlign="center" sx={{ mt: 3 }}>
                    <Link to="/register">{t("verifyEmail.changeEmail")}</Link>
                </Typography>
            </Paper>
        </Container>
    );
}

export default VerifyEmailPage;
