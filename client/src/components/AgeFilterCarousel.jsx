import { Box, Card, CardActionArea, Typography } from "@mui/material";

function AgeFilterCarousel({ selectedAgeRange, onSelectAge }) {
    const ageOptions = [
        { label: "All", value: "All", image: "/age/all.png" },
        { label: "0-6 Months", value: "0-6 Months", image: "/age/0-6.png" },
        { label: "6-12 Months", value: "6-12 Months", image: "/age/6-12.png" },
        { label: "1-2 Years", value: "1-2 Years", image: "/age/1-2.png" },
        { label: "2+ Years", value: "2+ Years", image: "/age/2-plus.png" },
        { label: "3-5 Years", value: "3-5 Years", image: "/age/3-5.png" },
        { label: "5+ Years", value: "5+ Years", image: "/age/5-plus.png" },
        { label: "6+ Years", value: "6+ Years", image: "/age/6-plus.png" },
        { label: "7+ Years", value: "7+ Years", image: "/age/7-plus.png" },
    ];

    return (
        <Box
            sx={{
                display: "flex",
                gap: 2,
                overflowX: "auto",
                pb: 1,
                mb: 3,
                scrollSnapType: "x mandatory",
            }}
        >
            {ageOptions.map((age) => {
                const isSelected = selectedAgeRange === age.value;

                return (
                    <Card
                        key={age.value}
                        sx={{
                            minWidth: 160,
                            height: "auto",
                            borderRadius: 0.5,
                            scrollSnapAlign: "start",
                            border: isSelected ? "3px solid" : "1px solid",
                            borderColor: isSelected ? "primary.main" : "divider",
                        }}
                    >
                        <CardActionArea onClick={() => onSelectAge(age.value)}>
                            <Box
                                component="img"
                                src={age.image}
                                alt={age.label}
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

export default AgeFilterCarousel;