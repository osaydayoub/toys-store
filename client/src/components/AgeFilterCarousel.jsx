import { Box, Card, CardActionArea, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";

function AgeFilterCarousel({ selectedAgeRange, onSelectAge }) {
    const { t } = useTranslation();
    const ageOptions = [
        { label: "All", value: "All", image: "/age/all.webp" },
        { label: "0-6 Months", value: "0-6 Months", image: "/age/0-6.webp" },
        { label: "6-12 Months", value: "6-12 Months", image: "/age/6-12.webp" },
        { label: "1-2 Years", value: "1-2 Years", image: "/age/1-2.webp" },
        { label: "2+ Years", value: "2+ Years", image: "/age/2-plus.webp" },
        { label: "3-5 Years", value: "3-5 Years", image: "/age/3-5.webp" },
        { label: "5+ Years", value: "5+ Years", image: "/age/5-plus.webp" },
        { label: "6+ Years", value: "6+ Years", image: "/age/6-plus.webp" },
        { label: "7+ Years", value: "7+ Years", image: "/age/7-plus.webp" },
    ];

    return (
        <Box
            sx={(theme) => ({
                display: "flex",
                gap: { xs: 1, sm: 2 },
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
            {ageOptions.map((age, index) => {
                const isSelected = selectedAgeRange === age.value;

                return (
                    <Card
                        key={age.value}
                        sx={{
                            minWidth: { xs: 140, sm: 160 },
                            height: "auto",
                            borderRadius: 0.5,
                            scrollSnapAlign: "start",
                            border: isSelected ? "3px solid" : "1px solid",
                            borderColor: isSelected ? "primary.main" : "divider",
                        }}
                    >
                        <CardActionArea
                            onClick={() => onSelectAge(age.value)}
                            sx={{ position: "relative" }}
                        >
                            <Box
                                component="img"
                                src={age.image}
                                alt={t(`ageRanges.${age.label}`)}
                                loading={index < 2 ? "eager" : "lazy"}
                                decoding="async"
                                sx={{
                                    width: "100%",
                                    height: "auto",
                                    objectFit: "cover",
                                    display: "block",
                                }}
                            />
                            <Chip
                                label={t(`ageRanges.${age.label}`)}
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

export default AgeFilterCarousel;
