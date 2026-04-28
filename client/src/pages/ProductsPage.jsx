import { useEffect, useState } from "react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import {
  Container,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";

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

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  const filteredAndSortedProducts = products
    .filter((product) => {
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      const matchesAgeRange =
        selectedAgeRange === "All" || product.ageRange === selectedAgeRange;

      return matchesCategory && matchesAgeRange;
    })
    .sort((a, b) => {
      if (sortBy === "price-low-high") {
        return a.price - b.price;
      }

      if (sortBy === "price-high-low") {
        return b.price - a.price;
      }

      return 0;
    });

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Toy Store Products
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <FormControl sx={{ minWidth: 200 }}>
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

        <FormControl sx={{ minWidth: 200 }}>
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

        <FormControl sx={{ minWidth: 200 }}>
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
      </Box>

      <Grid container spacing={3}>
        {filteredAndSortedProducts.length === 0 ? (
          <Typography color="text.secondary">
            No products match your filters.
          </Typography>
        ) : (
          filteredAndSortedProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <ProductCard product={product} />
            </Grid>
          ))
        )}
      </Grid>

    </Container>
  );
}

export default ProductsPage;