
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Home from "./pages/Home";
import Productlistings from "./pages/ProductListings";
import ProductDetails from "./pages/ProductDetails";
import WishList from "./pages/WishList";
import Cart from "./pages/Cart";
import AddressPage from "./pages/Address";
import Checkout from "./pages/CheckOut";
import OrderSummary from "./pages/OrderSummary";
import ProfilePage from "./pages/ProfilePage";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Nav from "./components/Nav";
import ProtectedRoute from "./components/protectedRoute";
import OrdersPage from "./pages/OrdersPage";
import { AuthProvider } from "./contexts/authContext";
import { CartProvider } from "./contexts/cartContext";
import { WishListProvider } from "./contexts/wishlistContext";

import { Toaster } from "react-hot-toast";

function App() {
  const [searchText, setSearchText] = useState("");

  return (
    <AuthProvider>
      <CartProvider>
        <WishListProvider>
          <BrowserRouter>
            <Nav setSearchText={setSearchText} />

            <Toaster position="top-right" />

            <Routes>
              <Route path="/" element={<Home />} />

              <Route
                path="/productlistings"
                element={<Productlistings searchText={searchText} />}
              />

              <Route
                path="/productlistings/:categoryId"
                element={<Productlistings searchText={searchText} />}
              />

              <Route
                path="/productDetails/:productId"
                element={<ProductDetails />}
              />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/wishlist" element={<WishList />} />
              <Route path="/cart" element={<Cart />} />

              <Route element={<ProtectedRoute />}>
                <Route
                  path="/addressDetails"
                  element={<AddressPage />}
                />

                <Route path="/checkout" element={<Checkout />} />

                <Route path="/orderSummary" element={<OrdersPage />} />
                <Route path="/orderSummary/:orderId" element={<OrderSummary />} />

                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </WishListProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
