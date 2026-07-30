import { Box, Card, CardActionArea, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";

function CategoryFilterCarousel({ selectedCategory, onSelectCategory }) {
    const { t } = useTranslation();
    const categoryOptions = [
        { translationKey: "productsPage.toysByAge", value: "all", image: "/category/all.webp" },
        { translationKey: "categories.Educational Toys", value: "educational", image: "/category/educational.webp" },
        { translationKey: "categories.Books & Stories", value: "books", image: "/category/books.webp" },
    ];

    return (
        <Box
            sx={(theme) => ({
                display: "flex",
                gap: { xs: 1, sm: 2 },
                mt: { xs: 1.5, md: 4 },
                pb: { xs: 0.5, sm: 1 },
                mb: { xs: 1.5, sm: 3 },
                overflowX: "auto",

                "&::-webkit-scrollbar": {
                    height: { xs: 5, sm: 8 },
                },
                "&::-webkit-scrollbar-track": {
                    backgroundColor: theme.palette.grey[200],
                    borderRadius: 10,
                },
                "&::-webkit-scrollbar-thumb": {
                    backgroundColor: theme.palette.secondary.main,
                    borderRadius: 10,
                },
                "&::-webkit-scrollbar-thumb:hover": {
                    backgroundColor: theme.palette.secondary.dark,
                },
            })}
        >
            {categoryOptions.map((category, index) => {
                const isSelected = selectedCategory === category.value;

                return (
                    <Card
                        key={category.value}
                        sx={{
                            width: { xs: 140, sm: 160 },
                            minWidth: { xs: 140, sm: 160 },
                            maxWidth: { xs: 140, sm: 160 },
                            flex: "0 0 auto",
                            height: "auto",
                            borderRadius: 0.5,
                            scrollSnapAlign: "start",
                            border: isSelected ? "3px solid" : "1px solid",
                            borderColor: isSelected ? "primary.main" : "divider",
                        }}
                    >
                        <CardActionArea
                            onClick={() => onSelectCategory(category.value)}
                            sx={{ position: "relative" }}
                        >
                            <Box
                                component="img"
                                src={category.image}
                                alt={t(category.translationKey)}
                                loading={index < 2 ? "eager" : "lazy"}
                                decoding="async"
                                sx={{
                                    width: "100%",
                                    aspectRatio: "1 / 1",
                                    objectFit: "cover",
                                    display: "block",
                                }}
                            />
                            <Chip
                                label={t(category.translationKey)}
                                size="small"
                                color="secondary"
                                sx={{
                                    position: "absolute",
                                    insetInlineEnd: 8,
                                    bottom: 8,
                                    maxWidth: "calc(100% - 16px)",
                                    fontWeight: 700,
                                    boxShadow: 2,
                                }}
                            />
                        </CardActionArea>
                    </Card>
                );
            })}
        </Box>
    );
}

export default CategoryFilterCarousel;
