import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  Snackbar,
  Collapse,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import ProductCard from "../components/ProductCard";

const categories = [
  "Educational Toys",
  "Sensory Toys",
  "Puzzle & Brain Games",
  "Motor Skills Toys",
  "Outdoor Toys",
  "Role-Play Toys",
  "Books & Stories",
  "Toy Sets",
  "Other",
];

const ageRanges = [
  "0-6 Months",
  "6-12 Months",
  "1-2 Years",
  "2+ Years",
  "3-5 Years",
  "5+ Years",
  "6+ Years",
  "7+ Years",
];


const initialFormData = {
  name: "",
  description: "",
  price: "",
  category: "",
  ageRange: "",
  stock: "",
};

function AdminProductsPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editingSlug, setEditingSlug] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [productToDelete, setProductToDelete] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewedProductIds, setViewedProductIds] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      setProducts(response.data.data);
    } catch (error) {
      setFeedback({
        type: "error",
        message: t("adminProducts.failedToLoad"),
      });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingSlug(null);
    setImageFile(null);
    setImageUrlInput("");
    setImageUrls([]);
    setShowUrlInput(false);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEdit = (product) => {
    setEditingSlug(product.slug);

    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      ageRange: product.ageRange,
      stock: product.stock,
    });

    setFeedback({ type: "", message: "" });
    setIsFormOpen(true);
    setImageUrls(product.images || []);
    setImageUrlInput("");
    setImageFile(null);
    setShowUrlInput(false);
  };

  const buildProductPayload = () => ({
    ...formData,
    price: Number(formData.price),
    stock: Number(formData.stock),
    images: imageUrls,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback({ type: "", message: "" });

    try {
      const productPayload = buildProductPayload();

      if (editingSlug) {
        await api.put(`/products/${editingSlug}`, productPayload);

        setFeedback({
          type: "success",
          message: t("adminProducts.updatedSuccessfully"),
        });
      } else {
        await api.post("/products", productPayload);

        setFeedback({
          type: "success",
          message: t("adminProducts.createdSuccessfully"),
        });
      }

      resetForm();
      setIsFormOpen(false);
      fetchProducts();
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error.response?.data?.message ||
          (editingSlug
            ? t("adminProducts.failedToUpdate")
            : t("adminProducts.failedToCreate")),
      });
    } finally {
      setIsUploading(false);
      setIsLoading(false);
    }
  };

  const handleDelete = async (slug) => {
    try {
      await api.delete(`/products/${slug}`);

      setFeedback({
        type: "success",
        message: t("adminProducts.deletedSuccessfully"),
      });

      if (editingSlug === slug) {
        resetForm();
      }

      fetchProducts();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.response?.data?.message ||
          t("adminProducts.failedToDelete"),
      });
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    await handleDelete(productToDelete.slug);
    setProductToDelete(null);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const viewProduct = (product) => {
    setViewedProductIds((prevIds) =>
      prevIds.includes(product._id)
        ? prevIds.filter((id) => id !== product._id)
        : [...prevIds, product._id]
    );
  };

  const addImageUrl = () => {
    const trimmedUrl = imageUrlInput.trim();

    if (!trimmedUrl) return;

    setImageUrls((prev) => [...prev, trimmedUrl]);
    setImageUrlInput("");
    setShowUrlInput(false);
  };

  const removeImageUrl = (urlToRemove) => {
    setImageUrls((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const uploadAndAddImage = async () => {
    if (!imageFile) return;

    setIsUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("image", imageFile);

      const response = await api.post("/upload", uploadFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setImageUrls((prev) => [...prev, response.data.data.url]);
      setImageFile(null);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.response?.data?.message ||
          t("adminProducts.failedToUploadImage"),
      });
    } finally {
      setIsUploading(false);
    }
  };

  const confirmRemoveImage = () => {
    if (!imageToDelete) return;

    removeImageUrl(imageToDelete);
    setImageToDelete(null);
  };

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom>
        {t("adminProducts.title")}
      </Typography>

      <Snackbar
        open={Boolean(feedback.message)}
        autoHideDuration={6000}
        onClose={() => setFeedback({ type: "", message: "" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={feedback.type || "info"}
          onClose={() => setFeedback({ type: "", message: "" })}
          sx={{ width: "100%" }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>

      <Button
        variant="contained"
        onClick={() => {
          resetForm();
          setIsFormOpen(true);
        }}
      >
        {t("adminProducts.addProduct")}
      </Button>

      <Dialog
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          resetForm();
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editingSlug
            ? t("adminProducts.editProduct")
            : t("adminProducts.createProduct")}
        </DialogTitle>

        <DialogContent dividers>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                required
                fullWidth
                label={t("adminProducts.name")}
                name="name"
                value={formData.name}
                onChange={handleChange}
              />

              <TextField
                required
                fullWidth
                multiline
                minRows={3}
                label={t("adminProducts.description")}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />

              <TextField
                required
                fullWidth
                label={t("adminProducts.price")}
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
              />

              <TextField
                required
                select
                fullWidth
                label={t("adminProducts.category")}
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {t(`categories.${category}`)}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                required
                select
                fullWidth
                label={t("adminProducts.ageRange")}
                name="ageRange"
                value={formData.ageRange}
                onChange={handleChange}
              >
                {ageRanges.map((age) => (
                  <MenuItem key={age} value={age}>
                    {t(`ageRanges.${age}`)}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                required
                fullWidth
                label={t("adminProducts.stock")}
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
              />

              <Button variant="outlined" component="label">
                {imageFile ? imageFile.name : t("adminProducts.chooseImage")}
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                />
              </Button>

              <Button
                variant="outlined"
                disabled={!imageFile || isUploading}
                onClick={uploadAndAddImage}
              >
                {isUploading ? t("adminProducts.uploading") : t("adminProducts.uploadImage")}
              </Button>

              <Button
                variant="outlined"
                onClick={() => setShowUrlInput((prev) => !prev)}
              >
                {t("adminProducts.addByUrl")}
              </Button>

              {showUrlInput && (
                <>
                  <TextField
                    fullWidth
                    label={t("adminProducts.imageUrl")}
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                  />

                  <Button variant="outlined" onClick={addImageUrl}>
                    {t("adminProducts.addImageUrl")}
                  </Button>
                </>
              )}

              {imageUrls.length > 0 && (
                <Stack spacing={1}>
                  {imageUrls.map((url) => (
                    <Box
                      key={url}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        component="img"
                        src={url}
                        alt={t("adminProducts.productImageAlt")}
                        sx={{
                          width: 70,
                          height: 70,
                          objectFit: "cover",
                          borderRadius: 1,
                        }}
                      />

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {url}
                      </Typography>

                      <Button
                        color="error"
                        variant="outlined"
                        onClick={() => setImageToDelete(url)}
                      >
                        {t("adminProducts.remove")}
                      </Button>
                    </Box>
                  ))}
                </Stack>
              )}

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button type="submit" variant="contained" disabled={isLoading}>
                  {isLoading
                    ? editingSlug
                      ? t("adminProducts.updating")
                      : t("adminProducts.creating")
                    : editingSlug
                      ? t("adminProducts.updateProduct")
                      : t("adminProducts.createProduct")}
                </Button>

                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => {
                    resetForm();
                    setIsFormOpen(false);
                  }}
                >
                  {t("adminProducts.cancel")}
                </Button>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>

      <Typography variant="h5" sx={{ mt: 5, mb: 2 }}>
        {t("adminProducts.existingProducts")}
      </Typography>

      <TextField
        label={t("adminProducts.searchProducts")}
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3, minWidth: 260 }}
      />

      {filteredProducts.length === 0 ? (
        <Typography color="text.secondary"> {t("adminProducts.noProducts")}</Typography>
      ) : (
        <Stack spacing={2}>
          {filteredProducts.map((product) => (
            <Paper
              key={product._id}
              sx={{
                p: 2,
                borderRadius: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h6">{product.name}</Typography>
                <Typography color="text.secondary">
                  {t("adminProducts.productStock", {
                    price: product.price,
                    stock: product.stock,
                  })}
                </Typography>
                <Typography color="text.secondary">{product.slug}</Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button variant="outlined" onClick={() => viewProduct(product)}>
                  {viewedProductIds.includes(product._id)
                    ? t("adminProducts.hideProduct")
                    : t("adminProducts.viewProduct")}
                </Button>

                <Button variant="outlined" onClick={() => handleEdit(product)}>
                  {t("adminProducts.edit")}
                </Button>

                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => setProductToDelete(product)}
                >
                  {t("adminProducts.delete")}
                </Button>
              </Box>

              <Collapse in={viewedProductIds.includes(product._id)}>
                <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                  <ProductCard product={product} />
                </Box>
              </Collapse>
            </Paper>
          ))}
        </Stack>
      )}

      <Dialog
        open={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
      >
        <DialogTitle>{t("adminProducts.deleteProductTitle")}</DialogTitle>

        <DialogContent>
          <DialogContentText>
            {t("adminProducts.deleteProductMessage", {
              name: productToDelete?.name,
            })}
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setProductToDelete(null)}>
            {t("adminProducts.cancel")}
          </Button>

          <Button color="error" variant="contained" onClick={confirmDeleteProduct}>
            {t("adminProducts.delete")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(imageToDelete)}
        onClose={() => setImageToDelete(null)}
      >
        <DialogTitle>{t("adminProducts.removeImageTitle")}</DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              py: 1,
            }}
          >
            <Box
              component="img"
              src={imageToDelete}
              alt={t("adminProducts.imageToRemoveAlt")}
              sx={{
                width: 120,
                height: 120,
                objectFit: "cover",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            />

            <DialogContentText>
              {t("adminProducts.removeImageMessage")}
            </DialogContentText>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setImageToDelete(null)}>
            {t("adminProducts.cancel")}
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={confirmRemoveImage}
          >
            {t("adminProducts.remove")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminProductsPage;