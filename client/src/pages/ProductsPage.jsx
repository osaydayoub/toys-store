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
import banner1 from "../assets/banner.png";
import banner2 from "../assets/desktop-banner.png";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";


const categories = [
  "All",
  "Educational Toys",
  "Sensory Toys",
  "Puzzle & Brain Games",
  "Motor Skills Toys",
  "Outdoor Toys",
  "Other",
];

const ageRanges = [
  "All",
  "0-6 Months",
  "6-12 Months",
  "1-2 Years",
  "3-5 Years",
  "6+ Years",
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
  const [productsPerPage, setProductsPerPage] = useState(6);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data.data);
      } catch (error) {
        setError("Failed to load products");
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
        <Loading text="Loading products..." />
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

        <Typography variant="h4" gutterBottom textAlign="center">
          Toy Store Products
        </Typography>

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
            label="Search products"
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
                ml: 1,
                display: { xs: "none", sm: "block" },
              }}
            >
              Filters
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
                <InputLabel>Category</InputLabel>
                <Select
                  label="Category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <InputLabel>Age Range</InputLabel>
                <Select
                  label="Age Range"
                  value={selectedAgeRange}
                  onChange={(e) => setSelectedAgeRange(e.target.value)}
                >
                  {ageRanges.map((age) => (
                    <MenuItem key={age} value={age}>
                      {age}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <InputLabel>Sort</InputLabel>
                <Select
                  label="Sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="default">Default</MenuItem>
                  <MenuItem value="price-low-high">Price: Low to High</MenuItem>
                  <MenuItem value="price-high-low">Price: High to Low</MenuItem>
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
            No products match your filters.
          </Typography>
        ) : (
          <>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mb: 2 }}
            >
              Showing {startIndex + 1}-{endIndex} of {totalProducts} products
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