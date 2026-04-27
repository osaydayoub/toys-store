import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
} from "@mui/material";

function ProductCard({ product }) {
  return (
    <Card sx={{ borderRadius: 3 }}>
      {product.images?.[0] && (
        <CardMedia
          component="img"
          height="180"
          image={product.images[0]}
          alt={product.name}
        />
      )}

      <CardContent>
        <Typography variant="h6">{product.name}</Typography>

        <Typography variant="body2" color="text.secondary">
          {product.description}
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          ₪{product.price}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          {product.ageRange}
        </Typography>

        <Button
          component={Link}
          to={`/products/${product.slug}`}
          variant="contained"
          sx={{ mt: 2 }}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}

export default ProductCard;