import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [profile, setProfile] = useState(user);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get("/auth/profile");
        const profileData = response.data.data;
        setProfile(profileData);
        setFormData({ name: profileData.name, phone: profileData.phone });
        updateUser(profileData);
      } catch (error) {
        setProfileError(
          error.response?.data?.message || t("profile.loadFailed")
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    try {
      setIsSaving(true);
      const response = await api.put("/auth/profile", formData);
      const profileData = response.data.data;
      setProfile(profileData);
      updateUser(profileData);
      setIsEditing(false);
      setProfileSuccess(t("profile.updateSuccess"));
    } catch (error) {
      setProfileError(
        error.response?.data?.message || t("profile.updateFailed")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(t("profile.passwordsDoNotMatch"));
      return;
    }

    try {
      setIsChangingPassword(true);
      await api.put("/auth/profile/password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
      setPasswordSuccess(t("profile.passwordChangeSuccess"));
    } catch (error) {
      setPasswordError(
        error.response?.data?.message || t("profile.passwordChangeFailed")
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 8 }}>
      <Box sx={{ px: { xs: 1, sm: 2 }, py: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
        >
          <AccountCircleOutlinedIcon sx={{ fontSize: 82, color: "primary.main" }} />
          <Box sx={{ flexGrow: 1, textAlign: { xs: "center", sm: "start" } }}>
            <Typography variant="h4" fontWeight={800}>
              {t("profile.greeting", { name: profile?.name })}
            </Typography>
            <Typography color="text.secondary">
              {t("profile.subtitle")}
            </Typography>
          </Box>
        </Stack>
        <Divider sx={{ my: 4 }} />

        <Box component="section">
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={700}>
            {t("profile.personalDetails")}
          </Typography>
          {!isEditing && (
            <Button startIcon={<EditOutlinedIcon />} onClick={() => setIsEditing(true)}>
              {t("profile.edit")}
            </Button>
          )}
        </Stack>
        <Divider sx={{ my: 2 }} />

        {profileError && <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>}
        {profileSuccess && <Alert severity="success" sx={{ mb: 2 }}>{profileSuccess}</Alert>}

        <Box component="form" onSubmit={handleProfileSubmit}>
          <TextField
            fullWidth
            required
            label={t("profile.name")}
            value={formData.name}
            onChange={(event) =>
              setFormData((current) => ({ ...current, name: event.target.value }))
            }
            disabled={!isEditing}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={t("profile.email")}
            value={profile?.email || ""}
            slotProps={{ input: { readOnly: true } }}
            helperText={t("profile.emailReadOnly")}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            required
            label={t("profile.phone")}
            value={formData.phone}
            onChange={(event) =>
              setFormData((current) => ({ ...current, phone: event.target.value }))
            }
            disabled={!isEditing}
          />

          {isEditing && (
            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button
                type="button"
                onClick={() => {
                  setFormData({ name: profile.name, phone: profile.phone });
                  setIsEditing(false);
                  setProfileError("");
                }}
              >
                {t("profile.cancel")}
              </Button>
              <Button type="submit" variant="contained" disabled={isSaving}>
                {isSaving ? t("profile.saving") : t("profile.save")}
              </Button>
            </Stack>
          )}
        </Box>
        </Box>
        <Divider sx={{ my: 4 }} />

        <Box component="section">
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {t("profile.security")}
        </Typography>
        {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}
        {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }}>{passwordSuccess}</Alert>}

        {!showPasswordForm ? (
          <Button
            startIcon={<LockResetOutlinedIcon />}
            onClick={() => {
              setShowPasswordForm(true);
              setPasswordError("");
              setPasswordSuccess("");
            }}
          >
            {t("profile.changePassword")}
          </Button>
        ) : (
          <Box component="form" onSubmit={handlePasswordSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              required
              type="password"
              label={t("profile.currentPassword")}
              value={passwordData.currentPassword}
              onChange={(event) =>
                setPasswordData((current) => ({
                  ...current,
                  currentPassword: event.target.value,
                }))
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              required
              type="password"
              label={t("profile.newPassword")}
              value={passwordData.newPassword}
              onChange={(event) =>
                setPasswordData((current) => ({
                  ...current,
                  newPassword: event.target.value,
                }))
              }
              inputProps={{ minLength: 6 }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              required
              type="password"
              label={t("profile.confirmPassword")}
              value={passwordData.confirmPassword}
              onChange={(event) =>
                setPasswordData((current) => ({
                  ...current,
                  confirmPassword: event.target.value,
                }))
              }
              inputProps={{ minLength: 6 }}
            />
            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setPasswordError("");
                }}
              >
                {t("profile.cancel")}
              </Button>
              <Button type="submit" variant="contained" disabled={isChangingPassword}>
                {isChangingPassword
                  ? t("profile.changingPassword")
                  : t("profile.savePassword")}
              </Button>
            </Stack>
          </Box>
        )}
        </Box>
        <Divider sx={{ my: 4 }} />

        <Box component="section">
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button
            variant="outlined"
            startIcon={<ReceiptLongOutlinedIcon />}
            onClick={() => navigate("/my-orders")}
          >
            {t("profile.myOrders")}
          </Button>
          <Button
            color="error"
            startIcon={<LogoutOutlinedIcon />}
            onClick={handleLogout}
          >
            {t("profile.logout")}
          </Button>
        </Stack>
        </Box>
      </Box>
    </Container>
  );
}

export default ProfilePage;
