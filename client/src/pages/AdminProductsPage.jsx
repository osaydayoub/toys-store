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
  Typography,
} from "@mui/material";
import api from "../services/api";

const categories = [
  "Educational Toys",
  "Sensory Toys",
  "Puzzle & Brain Games",
  "Motor Skills Toys",
  "Outdoor Toys",
  "Other",
];

const ageRanges = [
  "0-6 Months",
  "6-12 Months",
  "1-2 Years",
  "3-5 Years",
  "6+ Years",
];

const initialFormData = {
  name: "",
  description: "",
  price: "",
  category: "",
  ageRange: "",
  stock: "",
  images: "",
};

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editingSlug, setEditingSlug] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      setProducts(response.data.data);
    } catch (error) {
      setFeedback({
        type: "error",
        message: "Failed to load products",
      });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingSlug(null);
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
      images: product.images?.join(", ") || "",
    });

    setFeedback({ type: "", message: "" });
  };

  const buildProductPayload = () => ({
    ...formData,
    price: Number(formData.price),
    stock: Number(formData.stock),
    images: formData.images
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback({ type: "", message: "" });

    try {
      if (editingSlug) {
        await api.put(`/products/${editingSlug}`, buildProductPayload());

        setFeedback({
          type: "success",
          message: "Product updated successfully",
        });
      } else {
        await api.post("/products", buildProductPayload());

        setFeedback({
          type: "success",
          message: "Product created successfully",
        });
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error.response?.data?.message ||
          (editingSlug ? "Failed to update product" : "Failed to create product"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (slug) => {
    try {
      await api.delete(`/products/${slug}`);

      setFeedback({
        type: "success",
        message: "Product deleted successfully",
      });

      if (editingSlug === slug) {
        resetForm();
      }

      fetchProducts();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.response?.data?.message || "Failed to delete product",
      });
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom>
        Admin Products
      </Typography>

      {feedback.message && (
        <Alert severity={feedback.type} sx={{ mb: 3 }}>
          {feedback.message}
        </Alert>
      )}

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom>
          {editingSlug ? "Edit Product" : "Create Product"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              required
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />

            <TextField
              required
              fullWidth
              multiline
              minRows={3}
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />

            <TextField
              required
              fullWidth
              label="Price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
            />

            <TextField
              required
              select
              fullWidth
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              required
              select
              fullWidth
              label="Age Range"
              name="ageRange"
              value={formData.ageRange}
              onChange={handleChange}
            >
              {ageRanges.map((age) => (
                <MenuItem key={age} value={age}>
                  {age}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              required
              fullWidth
              label="Stock"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label="Image URLs separated by comma"
              name="images"
              value={formData.images}
              onChange={handleChange}
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button type="submit" variant="contained" disabled={isLoading}>
                {isLoading
                  ? editingSlug
                    ? "Updating..."
                    : "Creating..."
                  : editingSlug
                    ? "Update Product"
                    : "Create Product"}
              </Button>

              <Button type="button" variant="outlined" onClick={resetForm}>
                {editingSlug ? "Cancel Edit" : "Clear"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>

      <Typography variant="h5" sx={{ mt: 5, mb: 2 }}>
        Existing Products
      </Typography>

      {products.length === 0 ? (
        <Typography color="text.secondary">No products yet.</Typography>
      ) : (
        <Stack spacing={2}>
          {products.map((product) => (
            <Paper
              key={product._id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                borderRadius: 2,
              }}
            >
              <Box>
                <Typography variant="h6">{product.name}</Typography>
                <Typography color="text.secondary">
                  ₪{product.price} · {product.stock} in stock
                </Typography>
                <Typography color="text.secondary">{product.slug}</Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button variant="outlined" onClick={() => handleEdit(product)}>
                  Edit
                </Button>

                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => handleDelete(product.slug)}
                >
                  Delete
                </Button>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}
    </Container>
  );
}

export default AdminProductsPage;