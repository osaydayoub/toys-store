import { Link, useLocation } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

function ProductCard({ product }) {
  const { t } = useTranslation();
  const location = useLocation();
  const productCategories =
    product.categories?.length > 0
      ? product.categories
      : [product.category];
  const productsLocation = `${location.pathname}${location.search}`;

  const rememberProductsScrollPosition = () => {
    sessionStorage.setItem(
      `products-scroll:${productsLocation}`,
      String(window.scrollY)
    );
  };

  return (
    <Card
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {product.images?.[0] && (
        <CardMedia
          component="img"
          image={product.images[0]}
          alt={product.name}
          sx={{
            width: "100%",
            height: "auto",
            display: "block",
            flexShrink: 0,
            backgroundColor: "#f5f5f5",
          }}
        />
      )}

      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          sx={{
            mb: 1,
            fontSize: { xs: "1rem", md: "1.05rem" },
            fontWeight: 600,
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            overflow: "hidden",
          }}
        >
          {product.name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 1,
            overflow: "hidden",
          }}
        >
          {product.description}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap" }}>
          <Chip
            label={t(`ageRanges.${product.ageRange}`)}
            size="small"
            color="secondary"
          />
          {productCategories.slice(0, 2).map((category) => (
            <Chip
              key={category}
              label={t(`categories.${category}`)}
              size="small"
              variant="outlined"
            />
          ))}
        </Stack>

        <Typography
          variant="h6"
          color="primary"
          sx={{ mt: 0, mb: 2, fontWeight: 700 }}
        >
          ₪{product.price}
        </Typography>

        <Button
          component={Link}
          to={`/products/${product.slug}`}
          state={{ fromProducts: productsLocation }}
          onClick={rememberProductsScrollPosition}
          variant="contained"
          fullWidth
          sx={{ mt: { xs: 0, md: "auto" } }}
        >
          {t("productCard.viewDetails")}
        </Button>
      </CardContent>
    </Card>
  );
}

export default ProductCard;
