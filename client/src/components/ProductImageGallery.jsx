import { cloudinaryImage } from "../utils/cloudinaryImage";
import { useState } from "react";
import { Box, Paper, Stack } from "@mui/material";

function ProductImageGallery({ images = [], productName = "Product image" }) {
  const [selectedImage, setSelectedImage] = useState(images[0] || "");

  if (!images.length) {
    return (
      <Paper
        sx={{
          height: 360,
          borderRadius: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f5f5f5",
          color: "text.secondary",
        }}
      >
        No image available
      </Paper>
    );
  }

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "#f7f7f7",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          component="img"
          {...cloudinaryImage(selectedImage, "gallery",
            "(min-width: 1200px) 540px, (min-width: 900px) calc((100vw - 128px) / 2), (min-width: 600px) calc(100vw - 96px), calc(100vw - 80px)")}
          fetchPriority="high"
          alt={productName}
          sx={{
            width: "100%",
            height: { xs: 320, md: 420 },
            objectFit: "contain",
            display: "block",
          }}
        />
      </Paper>

      {images.length > 1 && (
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            mt: 2,
            overflowX: "auto",
            pb: 1,
          }}
        >
          {images.map((image) => {
            const isSelected = image === selectedImage;

            return (
              <Box
                key={image}
                component="img"
                {...cloudinaryImage(image, "thumbnail", "72px")}
                loading="lazy"
                decoding="async"
                alt={productName}
                onClick={() => setSelectedImage(image)}
                sx={{
                  width: 72,
                  flexShrink: 0,
                  height: 72,
                  objectFit: "cover",
                  borderRadius: 2,
                  cursor: "pointer",
                  border: "2px solid",
                  borderColor: isSelected ? "primary.main" : "divider",
                  opacity: isSelected ? 1 : 0.75,
                }}
              />
            );
          })}
        </Stack>
      )}
    </Box>
  );
}

export default ProductImageGallery;
