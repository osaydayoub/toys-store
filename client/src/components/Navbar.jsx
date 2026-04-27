import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Navbar() {
    const { totalItems } = useCart();
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography
                    component={Link}
                    to="/products"
                    variant="h6"
                    sx={{
                        color: "inherit",
                        textDecoration: "none",
                        flexGrow: 1,
                        fontWeight: 700,
                    }}
                >
                    Toy Store
                </Typography>

                <Box>
                    <Button component={Link} to="/products" color="inherit">
                        Products
                    </Button>
                    <Button component={Link} to="/cart" color="inherit">
                        Cart ({totalItems})
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;