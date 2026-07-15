import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import AdminProductsPage from "./pages/AdminProductsPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import CartProvider from "./context/CartContext";
import Footer from "./components/Footer";
import AuthProvider from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminRoute from "./components/AdminRoute";
import CheckoutPage from "./pages/CheckoutPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import PrivateRoute from "./components/PrivateRoute";
import MobileBottomNav from "./components/MobileBottomNav";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import AboutPage from "./pages/AboutPage";
function App() {
  return (
    <CartProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/products" />} />
            {/* <Route path="/admin/products" element={<AdminProductsPage />} /> */}
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminProductsPage />
                </AdminRoute>
              }
            />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:slug" element={<ProductDetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            <Route
              path="/checkout"
              element={
                <PrivateRoute>
                  <CheckoutPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <PrivateRoute>
                  <MyOrdersPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminOrdersPage />
                </AdminRoute>
              }
            />
          </Routes>
          <Footer />
          <MobileBottomNav />
        </BrowserRouter>
      </AuthProvider>
    </CartProvider>
  );
}

export default App;
