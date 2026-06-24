import { Box, Card, CardActionArea, Typography } from "@mui/material";

function CategoryFilterCarousel({ selectedCategory, onSelectCategory }) {
    const categoryOptions = [
        { label: "All", value: "All", image: "/category/all.png" },
        { label: "Educational Toys", value: "Educational Toys", image: "/category/educational.png" },
        { label: "Sensory Toys", value: "Sensory Toys", image: "/category/sensory.png" },
        { label: "Puzzle & Brain Games", value: "Puzzle & Brain Games", image: "/category/puzzle.png" },
        { label: "Motor Skills Toys", value: "Motor Skills Toys", image: "/category/motor.png" },
        { label: "Outdoor Toys", value: "Outdoor Toys", image: "/category/outdoor.png" },
        { label: "Role-Play Toys", value: "Role-Play Toys", image: "/category/role-play.png" },
        { label: "Books & Stories", value: "Books & Stories", image: "/category/books.png" },
        { label: "Toy Sets", value: "Toy Sets", image: "/category/sets.png" },
        { label: "Other", value: "Other", image: "/category/other.png" },
    ];

    return (
        <Box
            sx={(theme) => ({
                display: "flex",
                gap: 2,
                pb: 1,
                mb: 3,
                overflowX: "auto",

                "&::-webkit-scrollbar": {
                    height: 8,
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
            {categoryOptions.map((category) => {
                const isSelected = selectedCategory === category.value;

                return (
                    <Card
                        key={category.value}
                        sx={{
                            minWidth: 160,
                            height: "auto",
                            borderRadius: 0.5,
                            scrollSnapAlign: "start",
                            border: isSelected ? "3px solid" : "1px solid",
                            borderColor: isSelected ? "primary.main" : "divider",
                        }}
                    >
                        <CardActionArea onClick={() => onSelectCategory(category.value)}>
                            <Box
                                component="img"
                                src={category.image}
                                alt={category.label}
                                sx={{
                                    width: "100%",
                                    height: "auto",
                                    objectFit: "cover",
                                    display: "block",
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