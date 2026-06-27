import { useEffect, useState } from "react";
import {
  Box,
  Container,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Button,
  Collapse,
  TextField,
  Typography,
} from "@mui/material";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import Loading from "../components/Loading";
import AgeFilterCarousel from "../components/AgeFilterCarousel";
import CategoryFilterCarousel from "../components/CategoryFilterCarousel";
import banner1 from "../assets/banner.png";
import banner2 from "../assets/desktop-banner.png";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useTranslation } from "react-i18next";


const categories = [
  "All",
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
  "All",
  "0-6 Months",
  "6-12 Months",
  "1-2 Years",
  "2+ Years",
  "3-5 Years",
  "5+ Years",
  "6+ Years",
  "7+ Years",
];

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedAgeRange, setSelectedAgeRange] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(10);
  const { t } = useTranslation();

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data.data);
      } catch (error) {
        setError(t("productsPage.failedToLoad"));
      } finally {
        setIsLoading(false);
      }
    };

    getProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedAgeRange, sortBy, productsPerPage]);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredAndSortedProducts = products
    .filter((product) => {
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      const matchesAgeRange =
        selectedAgeRange === "All" || product.ageRange === selectedAgeRange;

      const matchesSearch =
        normalizedSearch === "" ||
        product.name.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesAgeRange && matchesSearch;
    })
    .slice()
    .sort((a, b) => {
      if (sortBy === "price-low-high") return a.price - b.price;
      if (sortBy === "price-high-low") return b.price - a.price;
      return 0;
    });

  const totalProducts = filteredAndSortedProducts.length;
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = Math.min(startIndex + productsPerPage, totalProducts);

  const paginatedProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Loading text={t("productsPage.loading")} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <>
      <Box
        component="img"
        src={banner1}
        alt="Baby Kids Toys Banner"
        sx={{
          display: {
            xs: "block",
            md: "none",
            mt: 2,
          },
          width: "100%",
          height: "auto",
        }}
      />
      <Container
        maxWidth="lg"
        sx={{
          mt: {
            xs: 0,
            md: 4,
          },
          mb: 6,
        }}
      >
        <Paper
          sx={{
            mb: 4,
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <Box
            component="img"
            src={banner2}
            alt="Banner"
            sx={{
              width: "100%",
              height: "auto",
              display: {
                xs: "none",
                md: "block",
              },
            }}
          />
        </Paper>

        <Typography variant="h5" gutterBottom textAlign="center">
          {t("productsPage.title")}
        </Typography>

        <Typography
          variant="h6"
          fontWeight={800}
          sx={{
            mb: 2,
            mt: 4,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {t("productsPage.shopByAge")}
        </Typography>
        <AgeFilterCarousel
          selectedAgeRange={selectedAgeRange}
          onSelectAge={setSelectedAgeRange}
        />
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{
            mb: 2,
            mt: 4,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {t("productsPage.shopByCategory")}
        </Typography>
        <CategoryFilterCarousel
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <Box
          sx={{
            display: "flex",
            gap: 1,
            mb: 2,
            alignItems: "center",
          }}
        >

          <TextField
            fullWidth
            label={t("productsPage.search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "primary.main" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            variant="outlined"
            onClick={() => setShowFilters((prev) => !prev)}
            sx={{
              minWidth: { xs: 56, sm: 130 },
              width: { xs: 56, sm: "auto" },
              height: 56,
              flexShrink: 0,
            }}
          >
            <FilterListIcon />

            <Box
              sx={{
                marginInlineStart: 1,
                display: { xs: "none", sm: "block" },
              }}
            >
              {t("productsPage.filters")}
            </Box>
          </Button>
        </Box>

        <Collapse in={showFilters}>
          <Paper sx={{ p: 2, mb: 4, borderRadius: 3 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: 2,
              }}
            >
              <FormControl>
                <InputLabel>{t("productsPage.category")}</InputLabel>
                <Select
                  label={t("productsPage.category")}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {t(`categories.${category}`)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <InputLabel>{t("productsPage.ageRange")}</InputLabel>
                <Select
                  label={t("productsPage.ageRange")}
                  value={selectedAgeRange}
                  onChange={(e) => setSelectedAgeRange(e.target.value)}
                >
                  {ageRanges.map((age) => (
                    <MenuItem key={age} value={age}>
                      {t(`ageRanges.${age}`)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <InputLabel>{t("productsPage.sort")}</InputLabel>
                <Select
                  label={t("productsPage.sort")}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="default">{t("productsPage.defaultSort")}</MenuItem>
                  <MenuItem value="price-low-high">{t("productsPage.priceLowHigh")}</MenuItem>
                  <MenuItem value="price-high-low">{t("productsPage.priceHighLow")}</MenuItem>
                </Select>
              </FormControl>

              <FormControl>
                <InputLabel>Per Page</InputLabel>
                <Select
                  label="Per Page"
                  value={productsPerPage}
                  onChange={(e) => setProductsPerPage(Number(e.target.value))}
                >
                  <MenuItem value={4}>4</MenuItem>
                  <MenuItem value={6}>6</MenuItem>
                  <MenuItem value={8}>8</MenuItem>
                  <MenuItem value={12}>12</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>
        </Collapse>


        {paginatedProducts.length === 0 ? (
          <Typography textAlign="center" color="text.secondary">
            {t("productsPage.noProducts")}
          </Typography>
        ) : (
          <>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mb: 2 }}
            >
              {t("productsPage.showing", {
                start: startIndex + 1,
                end: endIndex,
                total: totalProducts,
              })}
            </Typography>

            <Grid container spacing={3} justifyContent="center" sx={{ mt: 2 }}>
              {paginatedProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(event, value) => setCurrentPage(value)}
                  color="primary"
                  shape="rounded"
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </>

  );
}

export default ProductsPage;