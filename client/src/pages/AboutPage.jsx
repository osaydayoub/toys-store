import {
  Box,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import { useTranslation } from "react-i18next";

function AboutPage() {
  const { t } = useTranslation();

  return (
    <Box
      component="main"
      sx={{
        py: { xs: 4, md: 8 },
        background:
          "linear-gradient(180deg, rgba(247, 243, 239, 0.75) 0%, rgba(255, 255, 255, 0) 45%)",
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={{ xs: 3, md: 4 }}>
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                mx: "auto",
                mb: 2,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                color: "primary.main",
                backgroundColor: "rgba(247, 243, 239, 0.9)",
              }}
            >
              <ChildCareIcon sx={{ fontSize: 36 }} />
            </Box>

            <Typography
              component="h1"
              variant="h3"
              fontWeight={800}
              color="primary.main"
            >
              {t("about.title")}
            </Typography>

            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ mt: 2 }}
            >
              {t("about.greeting")}
            </Typography>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ mt: 2 }}
            >
              {t("about.profession")}
            </Typography>

          </Box>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4, md: 5 },
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack spacing={3}>
              {[1, 2, 3, 4].map((paragraph) => (
                <Typography
                  key={paragraph}
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: "1rem", md: "1.08rem" },
                    lineHeight: 2,
                    textAlign: "start",
                  }}
                >
                  {t(`about.paragraph${paragraph}`)}
                </Typography>
              ))}
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              position: "relative",
              overflow: "hidden",
              p: { xs: 3, sm: 4 },
              borderRadius: 4,
              textAlign: "center",
              color: "primary.dark",
              backgroundColor: "#F7F3EF",
            }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ lineHeight: 1.9 }}
            >
              {t("about.quote")}
            </Typography>
          </Paper>

          <Stack alignItems="center" spacing={1.5} sx={{ textAlign: "center" }}>
            <VolunteerActivismIcon color="primary" sx={{ fontSize: 34 }} />

            <Typography variant="h5" fontWeight={800}>
              {t("about.name")}
            </Typography>

            <Typography color="text.secondary" fontWeight={600}>
              {t("about.profession")}
            </Typography>

            <Divider sx={{ width: 72, my: 1 }} />

            <Typography color="primary.main" fontWeight={700}>
              {t("about.tagline")}
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

export default AboutPage;
