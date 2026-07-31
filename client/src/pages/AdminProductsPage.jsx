import { useEffect, useRef, useState } from "react";
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
  Checkbox,
  ListItemText,
  Grid,
  Chip,
  IconButton,
  Menu,
  ListItemIcon,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import AgeFilterCarousel from "../components/AgeFilterCarousel";

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

const carouselFilters = [
  "All",
  ...ageRanges,
  "books",
  "sets",
  "educational",
];


const initialFormData = {
  name: "",
  description: "",
  price: "",
  categories: [],
  ageRange: "",
  stock: "",
};

function AdminProductsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug: routeSlug } = useParams();
  const isFormPage = location.pathname !== "/admin/products";
  const isEditing = Boolean(routeSlug);
  const isRtl = i18n.dir() === "rtl";
  const filterParam = searchParams.get("filter");
  const carouselFilter = carouselFilters.includes(filterParam)
    ? filterParam
    : "All";
  const adminProductsReturnPath =
    location.state?.fromAdmin || "/admin/products";
  const [products, setProducts] = useState([]);
  const [areProductsLoading, setAreProductsLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(
    location.state?.feedback || { type: "", message: "" },
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState({
    type: "all",
    maximum: null,
  });
  const [lowStockDialogOpen, setLowStockDialogOpen] = useState(false);
  const [maximumStockInput, setMaximumStockInput] = useState("5");
  const [productToDelete, setProductToDelete] = useState(null);
  const [productMenuAnchor, setProductMenuAnchor] = useState(null);
  const [productMenuProduct, setProductMenuProduct] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [draggedImageIndex, setDraggedImageIndex] = useState(null);
  const [imageDragState, setImageDragState] = useState(null);
  const [areImagesSettling, setAreImagesSettling] = useState(false);
  const activeImageIndexRef = useRef(null);
  const targetImageIndexRef = useRef(null);
  const imageListRef = useRef(null);

  const fetchProducts = async () => {
    setAreProductsLoading(true);

    try {
      const response = await api.get("/products");
      setProducts(response.data.data);
    } catch (error) {
      setFeedback({
        type: "error",
        message: t("adminProducts.failedToLoad"),
      });
    } finally {
      setAreProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  useEffect(() => {
    if (areProductsLoading || location.pathname !== "/admin/products") return;

    const storageKey = `products-scroll:${location.pathname}${location.search}`;
    const savedScrollPosition = sessionStorage.getItem(storageKey);

    if (savedScrollPosition === null) return;

    sessionStorage.removeItem(storageKey);
    const timeoutId = window.setTimeout(() => {
      window.scrollTo({
        top: Number(savedScrollPosition),
        behavior: "auto",
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [areProductsLoading, location.pathname, location.search]);

  useEffect(() => {
    if (!routeSlug) return;

    const loadProduct = async () => {
      try {
        const response = await api.get(`/products/${routeSlug}`);
        const product = response.data.data;

        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          categories:
            product.categories?.length > 0
              ? product.categories
              : [product.category],
          ageRange: product.ageRange,
          stock: product.stock,
        });
        setImageUrls(product.images || []);
      } catch {
        setFeedback({ type: "error", message: t("productDetails.notFound") });
      }
    };

    loadProduct();
  }, [routeSlug, t]);

  const resetForm = () => {
    setFormData(initialFormData);
    setImageFile(null);
    setImageUrlInput("");
    setImageUrls([]);
    setShowUrlInput(false);
    setDraggedImageIndex(null);
    setImageDragState(null);
    setAreImagesSettling(false);
    activeImageIndexRef.current = null;
    targetImageIndexRef.current = null;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCategoriesChange = (event) => {
    const value = event.target.value;

    setFormData((previous) => ({
      ...previous,
      categories:
        typeof value === "string"
          ? value.split(",").filter(Boolean)
          : value,
    }));
  };

  const handleEdit = (product) => {
    const adminProductsLocation = `${location.pathname}${location.search}`;

    sessionStorage.setItem(
      `products-scroll:${adminProductsLocation}`,
      String(window.scrollY),
    );

    navigate(`/admin/products/${product.slug}/edit`, {
      state: {
        fromAdmin: adminProductsLocation,
      },
    });
  };

  const handleCarouselFilterChange = (filter) => {
    const nextParams = new URLSearchParams(searchParams);

    if (filter === "All") {
      nextParams.delete("filter");
    } else {
      nextParams.set("filter", filter);
    }

    setSearchParams(nextParams, { replace: true });
  };

  const buildProductPayload = () => ({
    ...formData,
    category: formData.categories[0],
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

      if (isEditing) {
        await api.put(`/products/${routeSlug}`, productPayload);

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

      const successMessage = isEditing
        ? t("adminProducts.updatedSuccessfully")
        : t("adminProducts.createdSuccessfully");

      resetForm();
      navigate(adminProductsReturnPath, {
        state: {
          feedback: { type: "success", message: successMessage },
        },
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error.response?.data?.message ||
          (isEditing
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

  const outOfStockCount = products.filter(
    (product) => Number(product.stock) === 0
  ).length;

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const productCategories =
      product.categories?.length > 0
        ? product.categories
        : [product.category];
    const matchesCarousel =
      carouselFilter === "All" ||
      (carouselFilter === "books" &&
        productCategories.includes("Books & Stories")) ||
      (carouselFilter === "sets" &&
        productCategories.includes("Toy Sets")) ||
      (carouselFilter === "educational" &&
        productCategories.includes("Educational Toys")) ||
      product.ageRange === carouselFilter;
    const productStock = Number(product.stock);
    const matchesStock =
      stockFilter.type === "all" ||
      (stockFilter.type === "out" && productStock === 0) ||
      (stockFilter.type === "maximum" &&
        productStock <= stockFilter.maximum);

    return matchesSearch && matchesCarousel && matchesStock;
  });

  const parsedMaximumStock = Number(maximumStockInput);
  const isMaximumStockValid =
    maximumStockInput.trim() !== "" &&
    Number.isInteger(parsedMaximumStock) &&
    parsedMaximumStock >= 0;

  const applyMaximumStockFilter = () => {
    if (!isMaximumStockValid) return;

    setStockFilter({
      type: "maximum",
      maximum: parsedMaximumStock,
    });
    setLowStockDialogOpen(false);
  };

  const openProductMenu = (event, product) => {
    setProductMenuAnchor(event.currentTarget);
    setProductMenuProduct(product);
  };

  const closeProductMenu = () => {
    setProductMenuAnchor(null);
    setProductMenuProduct(null);
  };

  const updateProductFromMenu = () => {
    if (!productMenuProduct) return;

    const product = productMenuProduct;
    closeProductMenu();
    handleEdit(product);
  };

  const deleteProductFromMenu = () => {
    if (!productMenuProduct) return;

    const product = productMenuProduct;
    closeProductMenu();
    setProductToDelete(product);
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

  const handleImagePointerDown = (event, index, url) => {
    event.preventDefault();
    const imageRow = event.currentTarget.closest("[data-image-index]");
    const rowRect = imageRow.getBoundingClientRect();
    const nextRow = imageRow.nextElementSibling;
    const rowStep = nextRow
      ? nextRow.getBoundingClientRect().top - rowRect.top
      : rowRect.height + 8;

    event.currentTarget.setPointerCapture(event.pointerId);
    activeImageIndexRef.current = index;
    targetImageIndexRef.current = index;
    setDraggedImageIndex(index);
    setImageDragState({
      url,
      startY: event.clientY,
      currentY: event.clientY,
      rowStep,
    });
  };

  const handleImagePointerMove = (event) => {
    if (activeImageIndexRef.current === null) return;
    event.preventDefault();

    const dialogContent = event.currentTarget.closest(".MuiDialogContent-root");
    if (dialogContent) {
      const contentRect = dialogContent.getBoundingClientRect();
      const scrollEdgeSize = 56;

      if (event.clientY < contentRect.top + scrollEdgeSize) {
        dialogContent.scrollBy({ top: -12 });
      } else if (event.clientY > contentRect.bottom - scrollEdgeSize) {
        dialogContent.scrollBy({ top: 12 });
      }
    }

    setImageDragState((previous) =>
      previous
        ? {
            ...previous,
            currentY: event.clientY,
          }
        : previous,
    );

    const imageRows = Array.from(
      imageListRef.current?.querySelectorAll("[data-image-index]") || [],
    );
    const listRect = imageListRef.current?.getBoundingClientRect();
    const rowHeight = imageRows[0]?.getBoundingClientRect().height || 1;
    const rowStep =
      imageRows.length > 1
        ? imageRows[1].offsetTop - imageRows[0].offsetTop
        : rowHeight + 8;
    const rawTargetIndex = Math.round(
      (event.clientY - (listRect?.top || 0) - rowHeight / 2) / rowStep,
    );
    targetImageIndexRef.current = Math.max(
      0,
      Math.min(imageRows.length - 1, rawTargetIndex),
    );
  };

  const handleImagePointerEnd = () => {
    const sourceIndex = activeImageIndexRef.current;
    const targetIndex = targetImageIndexRef.current;
    const previousPositions = new Map();

    imageListRef.current
      ?.querySelectorAll("[data-image-url]")
      .forEach((row) => {
        previousPositions.set(
          row.dataset.imageUrl,
          row.getBoundingClientRect().top,
        );
      });

    if (
      Number.isInteger(sourceIndex) &&
      Number.isInteger(targetIndex) &&
      sourceIndex !== targetIndex
    ) {
      setImageUrls((previousUrls) => {
        const reorderedUrls = [...previousUrls];
        const [movedUrl] = reorderedUrls.splice(sourceIndex, 1);
        reorderedUrls.splice(targetIndex, 0, movedUrl);
        return reorderedUrls;
      });
    }

    activeImageIndexRef.current = null;
    targetImageIndexRef.current = null;
    setAreImagesSettling(true);
    setDraggedImageIndex(null);
    setImageDragState(null);

    window.requestAnimationFrame(() => {
      const animations = [];

      imageListRef.current
        ?.querySelectorAll("[data-image-url]")
        .forEach((row) => {
          const previousTop = previousPositions.get(row.dataset.imageUrl);
          if (previousTop === undefined) return;

          const distance = previousTop - row.getBoundingClientRect().top;
          if (Math.abs(distance) < 1) return;

          animations.push(row.animate(
            [
              { transform: `translateY(${distance}px)` },
              { transform: "translateY(0)" },
            ],
            {
              duration: 180,
              easing: "cubic-bezier(0.2, 0, 0, 1)",
            },
          ));
        });

      if (animations.length === 0) {
        setAreImagesSettling(false);
        return;
      }

      Promise.allSettled(animations.map((animation) => animation.finished))
        .then(() => setAreImagesSettling(false));
    });
  };

  const getImageRowTransform = (index) => {
    if (!imageDragState || draggedImageIndex === null) return "translateY(0)";

    const targetIndex = targetImageIndexRef.current ?? draggedImageIndex;
    const rowStep = imageDragState.rowStep;

    if (index === draggedImageIndex) {
      return `translateY(${imageDragState.currentY - imageDragState.startY}px) scale(1.01)`;
    }

    if (
      draggedImageIndex < targetIndex &&
      index > draggedImageIndex &&
      index <= targetIndex
    ) {
      return `translateY(-${rowStep}px)`;
    }

    if (
      draggedImageIndex > targetIndex &&
      index >= targetIndex &&
      index < draggedImageIndex
    ) {
      return `translateY(${rowStep}px)`;
    }

    return "translateY(0)";
  };

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom>
        {isFormPage
          ? isEditing
            ? t("adminProducts.editProduct")
            : t("adminProducts.createProduct")
          : t("adminProducts.title")}
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

      {isFormPage && (
      <Paper sx={{ mt: 2, p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        <Box>
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
                name="categories"
                value={formData.categories}
                onChange={handleCategoriesChange}
                slotProps={{
                  select: {
                    multiple: true,
                    renderValue: (selected) =>
                      selected
                        .map((category) => t(`categories.${category}`))
                        .join(", "),
                  },
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    <Checkbox
                      checked={formData.categories.includes(category)}
                    />
                    <ListItemText primary={t(`categories.${category}`)} />
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
                <Stack ref={imageListRef} spacing={1}>
                  {imageUrls.map((url, index) => (
                    <Box
                      key={url}
                      data-image-index={index}
                      data-image-url={url}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 1,
                        border: "1px solid",
                        borderColor:
                          draggedImageIndex === index
                            ? "secondary.main"
                            : "divider",
                        borderRadius: 2,
                        position: "relative",
                        zIndex: draggedImageIndex === index ? 2 : 1,
                        transform: getImageRowTransform(index),
                        transition:
                          areImagesSettling
                            ? "none"
                            : draggedImageIndex === index
                            ? "border-color 120ms"
                            : "transform 180ms ease, border-color 120ms",
                        backgroundColor: "background.paper",
                        "&:active": {
                          cursor: "grabbing",
                        },
                      }}
                    >
                      <Box
                        onPointerDown={(event) =>
                          handleImagePointerDown(event, index, url)
                        }
                        onPointerMove={handleImagePointerMove}
                        onPointerUp={handleImagePointerEnd}
                        onPointerCancel={handleImagePointerEnd}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          alignSelf: "stretch",
                          touchAction: "none",
                          cursor: "grab",
                        }}
                      >
                        <DragIndicatorIcon
                          color="action"
                          aria-hidden="true"
                          sx={{ flexShrink: 0 }}
                        />
                      </Box>
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
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading || formData.categories.length === 0}
                >
                  {isLoading
                    ? isEditing
                      ? t("adminProducts.updating")
                      : t("adminProducts.creating")
                    : isEditing
                      ? t("adminProducts.updateProduct")
                      : t("adminProducts.createProduct")}
                </Button>

                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => {
                    resetForm();
                    navigate(adminProductsReturnPath);
                  }}
                >
                  {t("adminProducts.cancel")}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Paper>
      )}

      {!isFormPage && (
      <>
      <Typography variant="h5" sx={{ mt: 5, mb: 2 }}>
        {t("adminProducts.existingProducts")}
      </Typography>

      <AgeFilterCarousel
        selectedFilter={carouselFilter}
        onSelectFilter={handleCarouselFilterChange}
      />

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() =>
          navigate("/admin/products/new", {
            state: {
              fromAdmin: `${location.pathname}${location.search}`,
            },
          })
        }
        sx={{ mb: 3 }}
      >
        {t("adminProducts.addProduct")}
      </Button>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
          mb: 3,
        }}
      >
        <TextField
          label={t("adminProducts.searchProducts")}
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 260, flexGrow: { xs: 1, sm: 0 } }}
        />

        <Button
          variant={stockFilter.type === "out" ? "contained" : "outlined"}
          color={stockFilter.type === "out" ? "warning" : "primary"}
          onClick={() => setStockFilter({ type: "out", maximum: null })}
          sx={{ minHeight: 40 }}
        >
          {t("adminProducts.showOutOfStock", {
            count: outOfStockCount,
          })}
        </Button>

        <Button
          variant={stockFilter.type === "maximum" ? "contained" : "outlined"}
          color={stockFilter.type === "maximum" ? "warning" : "primary"}
          onClick={() => setLowStockDialogOpen(true)}
          sx={{ minHeight: 40 }}
        >
          {stockFilter.type === "maximum"
            ? t("adminProducts.stockAtMostActive", {
              maximum: stockFilter.maximum,
            })
            : t("adminProducts.stockAtMost")}
        </Button>

        {stockFilter.type !== "all" && (
          <Button
            variant="text"
            onClick={() => setStockFilter({ type: "all", maximum: null })}
            sx={{ minHeight: 40 }}
          >
            {t("adminProducts.showAllProducts")}
          </Button>
        )}
      </Box>

      {filteredProducts.length === 0 ? (
        <Typography color="text.secondary">
          {stockFilter.type === "out"
            ? t("adminProducts.noOutOfStockProducts")
            : stockFilter.type === "maximum"
              ? t("adminProducts.noProductsAtMost", {
                maximum: stockFilter.maximum,
              })
              : t("adminProducts.noProducts")}
        </Typography>
      ) : (
        <Grid container spacing={3} justifyContent="center" sx={{ mt: 1 }}>
          {filteredProducts.map((product) => (
            <Grid
              key={product._id}
              size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
              sx={{ display: "flex" }}
            >
              <ProductCard
                product={product}
                topAction={
                  <IconButton
                    aria-label={`${t("adminProducts.edit")} / ${t("adminProducts.delete")}`}
                    onClick={(event) => openProductMenu(event, product)}
                    sx={{
                      position: "absolute",
                      top: 8,
                      insetInlineStart: 8,
                      zIndex: 2,
                      bgcolor: "background.paper",
                      boxShadow: 1,
                      "&:hover": { bgcolor: "background.paper" },
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                }
                extraInfo={
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mb: 2, flexWrap: "wrap", rowGap: 1 }}
                  >
                    <Chip
                      label={product.slug}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`${t("adminProducts.stock")}: ${product.stock}`}
                      size="small"
                      color={Number(product.stock) === 0 ? "error" : "success"}
                    />
                  </Stack>
                }
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={lowStockDialogOpen}
        onClose={() => setLowStockDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{t("adminProducts.stockAtMostTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t("adminProducts.stockAtMostMessage")}
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            type="number"
            label={t("adminProducts.maximumStock")}
            value={maximumStockInput}
            onChange={(event) => setMaximumStockInput(event.target.value)}
            inputProps={{ min: 0, step: 1 }}
            error={maximumStockInput.trim() !== "" && !isMaximumStockValid}
            helperText={
              maximumStockInput.trim() !== "" && !isMaximumStockValid
                ? t("adminProducts.maximumStockInvalid")
                : " "
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLowStockDialogOpen(false)}>
            {t("adminProducts.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={applyMaximumStockFilter}
            disabled={!isMaximumStockValid}
          >
            {t("adminProducts.applyStockFilter")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
      >
        <DialogTitle>{t("adminProducts.deleteProductTitle")}</DialogTitle>

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
            {productToDelete?.images?.[0] && (
              <Box
                component="img"
                src={productToDelete.images[0]}
                alt={productToDelete.name}
                sx={{
                  width: 120,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              />
            )}

            <DialogContentText textAlign="center">
              {t("adminProducts.deleteProductMessage", {
                name: productToDelete?.name,
              })}
            </DialogContentText>
          </Box>
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
      </>
      )}

      <Menu
        anchorEl={productMenuAnchor}
        open={Boolean(productMenuAnchor)}
        onClose={closeProductMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: isRtl ? "right" : "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: isRtl ? "right" : "left",
        }}
        slotProps={{
          paper: {
            sx: { minWidth: 125, borderRadius: 1, mt: 0.5 },
          },
        }}
      >
        <MenuItem onClick={updateProductFromMenu}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("adminProducts.edit")} />
        </MenuItem>

        <MenuItem onClick={deleteProductFromMenu} sx={{ color: "error.main" }}>
          <ListItemIcon sx={{ color: "error.main" }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("adminProducts.delete")} />
        </MenuItem>
      </Menu>

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
