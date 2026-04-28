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

function ProductCard({ product }) {
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
          <Chip label={product.ageRange} size="small" color="secondary" />
          <Chip label={product.category} size="small" variant="outlined" />
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
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}

export default ProductCard;