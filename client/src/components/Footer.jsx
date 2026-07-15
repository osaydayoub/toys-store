import {
  Box,
  Container,
  Typography,
  IconButton,
  Stack,
  Divider,
} from "@mui/material";

import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";

import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

function Footer() {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        mt: 8,
        py: 5,
        backgroundColor: "#F7F3EF",
        borderTop: "1px solid #eee",
        pb: { xs: 10, md: 5 },
      }}
    >
      <Container maxWidth="lg">
        <Stack
          spacing={4}
          alignItems="center"
          textAlign="center"
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              justifyContent: "center",
              gap: { xs: 3, md: 6 },
              mb: 4,
            }}
          >
            <Box
              component={Link}
              to="/products"
              aria-label={t("navbar.products")}
              sx={{
                display: "block",
                lineHeight: 0,
                textDecoration: "none",
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="Baby Kids Toys"
                sx={{
                  width: 120,
                  borderRadius: "50%",
                  cursor: "pointer",
                }}
              />
            </Box>

            <Box
              sx={{
                textAlign: {
                  xs: "center",
                  md: "start",
                },
                display: "flex",
                flexDirection: "column",
                alignItems: { xs: "center", md: "flex-start" },
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {t("footer.brand")}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {t("footer.description")}
                </Typography>
              </Box>

              {/* Quick Links */}
              <Stack
                direction="row"
                spacing={3}
                flexWrap="wrap"
                justifyContent={{ xs: "center", md: "flex-start" }}
                useFlexGap
                sx={{
                  display: {
                    xs: "none",
                    md: "flex",
                  },
                }}
              >
                <Typography
                  component={Link}
                  to="/products"
                  sx={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <StorefrontIcon fontSize="small" />
                  {t("navbar.products")}
                </Typography>

                <Typography
                  component={Link}
                  to="/cart"
                  sx={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <ShoppingCartIcon fontSize="small" />
                  {t("navbar.cartShort")}
                </Typography>

                <Typography
                  component={Link}
                  to="/my-orders"
                  sx={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <ReceiptLongIcon fontSize="small" />
                  {t("navbar.myOrders")}
                </Typography>

                <Typography
                  component={Link}
                  to="/about"
                  sx={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <InfoOutlinedIcon fontSize="small" />
                  {t("navbar.about")}
                </Typography>
              </Stack>

              {/* Socials */}
              <Stack direction="row" spacing={2}>
                <IconButton
                  component="a"
                  href="https://www.instagram.com/baby.kids_toys?igsh=MmE5OGhzcnZoazY5&utm_source=qr"
                  target="_blank"
                >
                  <InstagramIcon />
                </IconButton>

                <IconButton
                  component="a"
                  href="https://wa.me/972533413368"
                  target="_blank"
                >
                  <WhatsAppIcon />
                </IconButton>
              </Stack>
            </Box>
          </Box>





          <Divider flexItem />

          <Typography
            variant="caption"
            color="text.secondary"
          >
            {t("footer.copyright", {
              year: new Date().getFullYear(),
            })}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}

export default Footer;

