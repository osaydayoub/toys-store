import { Link } from "react-router-dom";
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
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {product.images?.[0] && (
        <CardMedia
          component="img"
          height="190"
          image={product.images[0]}
          alt={product.name}
          sx={{ objectFit: "cover", backgroundColor: "#f5f5f5" }}
        />
      )}

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom>
          {product.name}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {product.description}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
          <Chip label={t(`ageRanges.${product.ageRange}`)} size="small" color="secondary" />
          <Chip label={t(`categories.${product.category}`)} size="small" variant="outlined" />
        </Stack>

        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
          ₪{product.price}
        </Typography>

        <Button
          component={Link}
          to={`/products/${product.slug}`}
          variant="contained"
          fullWidth
        >
          {t("productCard.viewDetails")}
        </Button>
      </CardContent>
    </Card>
  );
}

export default ProductCard;