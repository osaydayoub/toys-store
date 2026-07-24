import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const shippingCosts = {
  "Jerusalem District": 70,
  "Northern & Haifa District": 50,
  "Central District": 50,
  "Tel Aviv District": 70,
  "Southern District": 70,
  "West Bank": 70,
};

const emptyAddress = {
  region: "",
  city: "",
  street: "",
};

function CheckoutPage() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    ...emptyAddress,
    phone: user?.phone || "",
  });
  const [newAddressDraft, setNewAddressDraft] = useState(emptyAddress);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("new");
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isDeletingAddress, setIsDeletingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");

  const [success, setSuccess] = useState("");
  const [createdOrderNumber, setCreatedOrderNumber] = useState("");
  const shippingCost = formData.region ? shippingCosts[formData.region] : 0;
  const finalTotal = totalPrice + shippingCost;

  useEffect(() => {
    const loadSavedAddresses = async () => {
      try {
        const response = await api.get("/auth/saved-addresses");
        const addresses = response.data.data;
        setSavedAddresses(addresses);

        if (addresses.length > 0) {
          const latestAddress = addresses[0];
          setSelectedAddressId(latestAddress._id);
          setFormData((current) => ({
            region: latestAddress.region,
            city: latestAddress.city,
            street: latestAddress.street,
            phone: current.phone || user?.phone || "",
          }));
        }
      } catch {
        setAddressError(t("checkout.addressLoadFailed"));
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    loadSavedAddresses();
  }, [t, user?.phone]);

  const selectAddress = (addressId, addresses = savedAddresses) => {
    setSelectedAddressId(addressId);

    if (addressId === "new") {
      setFormData((current) => ({
        ...newAddressDraft,
        phone: current.phone || user?.phone || "",
      }));
      return;
    }

    const selectedAddress = addresses.find(
      (address) => address._id === addressId
    );

    if (!selectedAddress) return;

    setFormData((current) => ({
      region: selectedAddress.region,
      city: selectedAddress.city,
      street: selectedAddress.street,
      phone: current.phone || user?.phone || "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (Object.hasOwn(emptyAddress, name)) {
      setNewAddressDraft((current) => ({
        ...current,
        [name]: value,
      }));
    }
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;

    try {
      setIsDeletingAddress(true);
      setAddressError("");
      const response = await api.delete(
        `/auth/saved-addresses/${addressToDelete._id}`
      );
      const remainingAddresses = response.data.data;
      setSavedAddresses(remainingAddresses);

      if (selectedAddressId === addressToDelete._id) {
        if (remainingAddresses.length > 0) {
          selectAddress(remainingAddresses[0]._id, remainingAddresses);
        } else {
          selectAddress("new", remainingAddresses);
        }
      }

      setAddressToDelete(null);
    } catch {
      setAddressError(t("checkout.addressDeleteFailed"));
    } finally {
      setIsDeletingAddress(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const orderData = {
        items: cartItems,
        shippingAddress: formData,
        deliveryNote: deliveryNote,
      };

      const response = await api.post("/orders", orderData);
      setCreatedOrderNumber(response.data.data.orderNumber);

      clearCart();
      setSuccess(t("checkout.orderPlaced"));

      // setTimeout(() => {
      //   navigate("/products");
      // }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || t("checkout.failedToPlaceOrder"));
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0 && !success) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4">{t("checkout.title")}</Typography>
        <Typography>{t("checkout.emptyCart")}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t("checkout.title")}
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography fontWeight={700}>{success}</Typography>

            {createdOrderNumber && (
              <Typography sx={{ mt: 1 }}>
                <Typography sx={{ mt: 1 }}>
                  {t("checkout.orderNumber", { number: createdOrderNumber })}
                </Typography>
              </Typography>
            )}

            <Button
              component={Link}
              to="/my-orders"
              variant="contained"
              size="small"
              sx={{ mt: 2 }}
            >
              {t("checkout.goToMyOrders")}
            </Button>
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!success && (
          <>
            <Typography sx={{ mb: 1 }}>
              {t("checkout.itemsTotal", { total: totalPrice.toFixed(2) })}
            </Typography>

            <Typography sx={{ mb: 1 }}>
              {t("checkout.shipping", { cost: shippingCost.toFixed(2) })}
            </Typography>

            <Typography variant="h6" sx={{ mb: 2 }}>
              {t("checkout.total", { total: finalTotal.toFixed(2) })}
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                {t("checkout.deliveryAddress")}
              </Typography>

              {addressError && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {addressError}
                </Alert>
              )}

              {isLoadingAddresses ? (
                <Typography color="text.secondary" sx={{ py: 2 }}>
                  {t("checkout.loadingAddresses")}
                </Typography>
              ) : (
                <RadioGroup
                  value={selectedAddressId}
                  onChange={(event) => selectAddress(event.target.value)}
                  sx={{ mb: 1 }}
                >
                  {savedAddresses.map((address, index) => (
                    <Box key={address._id}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          py: 1,
                        }}
                      >
                        <FormControlLabel
                          value={address._id}
                          control={<Radio />}
                          sx={{ flexGrow: 1, m: 0 }}
                          label={
                            <Box>
                              <Typography fontWeight={700}>
                                {index === 0
                                  ? t("checkout.lastUsedAddress")
                                  : t("checkout.savedAddress", {
                                    number: index + 1,
                                  })}
                              </Typography>
                              <Typography color="text.secondary">
                                {t(`regions.${address.region}`)}, {address.city},{" "}
                                {address.street}
                              </Typography>
                            </Box>
                          }
                        />
                        <IconButton
                          color="error"
                          aria-label={t("checkout.deleteAddress")}
                          onClick={() => setAddressToDelete(address)}
                        >
                          <DeleteOutlinedIcon />
                        </IconButton>
                      </Box>
                      <Divider />
                    </Box>
                  ))}

                  <FormControlLabel
                    value="new"
                    control={<Radio />}
                    label={t("checkout.newAddress")}
                    sx={{ mt: savedAddresses.length > 0 ? 1 : 0, mx: 0 }}
                  />
                </RadioGroup>
              )}

              {selectedAddressId === "new" && (
                <>
              <TextField
                fullWidth
                required
                select
                margin="normal"
                label={t("checkout.region")}
                name="region"
                value={formData.region}
                onChange={handleChange}
              >
                {Object.entries(shippingCosts).map(([region, cost]) => (
                  <MenuItem key={region} value={region}>
                    {t(`regions.${region}`)} - ₪{cost}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                required
                margin="normal"
                label={t("checkout.city")}
                name="city"
                value={formData.city}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                required
                margin="normal"
                label={t("checkout.street")}
                name="street"
                value={formData.street}
                onChange={handleChange}
              />
                </>
              )}

              <TextField
                fullWidth
                required
                margin="normal"
                label={t("checkout.phone")}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                multiline
                minRows={2}
                margin="normal"
                label={t("checkout.deliveryNote")}
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                placeholder={t("checkout.deliveryNotePlaceholder")}
              />
              <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                <Button
                  component={Link}
                  to="/cart"
                  variant="outlined"
                  fullWidth
                >
                  {t("checkout.backToCart")}
                </Button>

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                >
                  {isLoading
                    ? t("checkout.placingOrder")
                    : t("checkout.placeOrder")}
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Paper>

      <Dialog
        open={Boolean(addressToDelete)}
        onClose={() => {
          if (!isDeletingAddress) setAddressToDelete(null);
        }}
      >
        <DialogTitle>{t("checkout.deleteAddressTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("checkout.deleteAddressMessage", {
              city: addressToDelete?.city,
              street: addressToDelete?.street,
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setAddressToDelete(null)}
            disabled={isDeletingAddress}
          >
            {t("checkout.cancelDeleteAddress")}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmDeleteAddress}
            disabled={isDeletingAddress}
          >
            {isDeletingAddress
              ? t("checkout.deletingAddress")
              : t("checkout.confirmDeleteAddress")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default CheckoutPage;
