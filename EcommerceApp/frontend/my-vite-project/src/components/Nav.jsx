
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaHeart,
  FaSearch,
  FaShoppingBag,
  FaShoppingCart,
  FaUser,
  FaBoxOpen,
  FaMapMarkerAlt,
  FaCommentDots,
  FaHeadset,
  FaCog,
  FaSignOutAlt,
  FaChevronDown,
  FaTimes,
} from "react-icons/fa";
import { useAuth } from "../contexts/authContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function Nav({ setSearchText }) {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const accountRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function fetchCategories() {
      try {
        const response = await fetch(`${API_URL}/api/categories`);
        if (!response.ok) return;

        const data = await response.json();

        if (active && Array.isArray(data)) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Unable to fetch categories:", error);
      }
    }

    fetchCategories();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target)
      ) {
        setAccountOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setAccountOpen(false);
        setMobileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleSearch(event) {
    event.preventDefault();

    setSearchText?.(search.trim());
    navigate("/productlistings");
    setMobileOpen(false);
  }

  function handleLogout() {
    logout();
    setAccountOpen(false);
    setMobileOpen(false);
    navigate("/", { replace: true });
  }

  function closeMenus() {
    setAccountOpen(false);
    setMobileOpen(false);
  }

  const firstName = user?.name?.trim().split(/\s+/)[0] || "Account";
  const initials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <header className="shopnest-navbar">
      <div className="shopnest-navbar-main">
        <Link
          to="/"
          className="shopnest-brand"
          onClick={closeMenus}
          aria-label="ShopNest home"
        >
          <span className="shopnest-brand-icon">
            <FaShoppingBag />
          </span>
          <span>ShopNest</span>
        </Link>

        <form
          className="shopnest-search"
          onSubmit={handleSearch}
          role="search"
        >
          <FaSearch className="shopnest-search-icon" />

          <input
            type="search"
            placeholder="Search products, brands and more..."
            aria-label="Search products"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button
              type="button"
              className="shopnest-search-clear"
              aria-label="Clear search"
              onClick={() => {
                setSearch("");
                setSearchText?.("");
              }}
            >
              <FaTimes />
            </button>
          )}

          <button type="submit" className="shopnest-search-submit">
            Search
          </button>
        </form>

        <div className="shopnest-navbar-actions">
          <Link
            to="/wishlist"
            className="shopnest-header-action"
            aria-label="Wishlist"
            onClick={closeMenus}
          >
            <span className="shopnest-header-action-icon">
              <FaHeart />
            </span>
            <span>Wishlist</span>
          </Link>

          <Link
            to="/cart"
            className="shopnest-header-action"
            aria-label="Shopping cart"
            onClick={closeMenus}
          >
            <span className="shopnest-header-action-icon">
              <FaShoppingCart />
            </span>
            <span>Cart</span>
          </Link>

          <div className="shopnest-account-wrapper" ref={accountRef}>
            <button
              type="button"
              className={`shopnest-account-trigger ${
                accountOpen ? "is-open" : ""
              }`}
              onClick={() => setAccountOpen((open) => !open)}
              aria-expanded={accountOpen}
              aria-haspopup="true"
              aria-label="Open account menu"
            >
              <span className="shopnest-user-avatar">
                {user ? initials : <FaUser />}
              </span>

              <span className="shopnest-account-trigger-text">
                <strong>
                  {loading
                    ? "Loading..."
                    : user
                      ? firstName
                      : "My Account"}
                </strong>
                <small>
                  {loading
                    ? "Please wait"
                    : user
                      ? "Your account"
                      : "Login or register"}
                </small>
              </span>

              <FaChevronDown className="shopnest-account-chevron" />
            </button>

            {accountOpen && (
              <div className="shopnest-account-dropdown">
                <div className="shopnest-dropdown-header">
                  <span className="shopnest-dropdown-avatar">
                    {user ? initials : <FaUser />}
                  </span>

                  <div className="shopnest-dropdown-identity">
                    <strong>
                      {user?.name || "Welcome to ShopNest"}
                    </strong>
                    <span>
                      {user?.email || "Sign in to manage your account"}
                    </span>
                  </div>
                </div>

                {!loading && (
                  <>
                    {user ? (
                      <>
                        <div className="shopnest-dropdown-section-label">
                          MY ACCOUNT
                        </div>

                        <Link
                          to="/profile"
                          className="shopnest-dropdown-item"
                          onClick={closeMenus}
                        >
                          <FaUser />
                          <span>My Profile</span>
                        </Link>

                        <Link
                          to="/orderSummary"
                          className="shopnest-dropdown-item"
                          onClick={closeMenus}
                        >
                          <FaBoxOpen />
                          <span>Orders & Purchases</span>
                        </Link>

                        <Link
                          to="/addressDetails"
                          className="shopnest-dropdown-item"
                          onClick={closeMenus}
                        >
                          <FaMapMarkerAlt />
                          <span>My Addresses</span>
                        </Link>

                        <div className="shopnest-dropdown-divider" />

                        <div className="shopnest-dropdown-section-label">
                          GENERAL
                        </div>

                        <a
                          href="mailto:support@shopnest.com?subject=ShopNest%20Feedback"
                          className="shopnest-dropdown-item"
                          onClick={closeMenus}
                        >
                          <FaCommentDots />
                          <span>Feedback</span>
                        </a>

                        <a
                          href="mailto:support@shopnest.com"
                          className="shopnest-dropdown-item"
                          onClick={closeMenus}
                        >
                          <FaHeadset />
                          <span>Contact Us & Support</span>
                        </a>

                        <div className="shopnest-dropdown-divider" />

                        <button
                          type="button"
                          className="shopnest-dropdown-item shopnest-dropdown-logout"
                          onClick={handleLogout}
                        >
                          <FaSignOutAlt />
                          <span>Logout</span>
                        </button>
                      </>
                    ) : (
                      <div className="shopnest-dropdown-auth">
                        <Link
                          to="/login"
                          className="shopnest-dropdown-login"
                          onClick={closeMenus}
                        >
                          Login
                        </Link>

                        <Link
                          to="/register"
                          className="shopnest-dropdown-register"
                          onClick={closeMenus}
                        >
                          Create an Account
                        </Link>
                      </div>
                    )}
                  </>
                )}

                <div className="shopnest-dropdown-footer">
                  ShopNest · Your everyday marketplace
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="shopnest-mobile-toggle"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      <nav
        className={`shopnest-category-nav ${
          mobileOpen ? "shopnest-category-nav-open" : ""
        }`}
        aria-label="Product categories"
      >
        <Link to="/productlistings" onClick={closeMenus}>
          All Products
        </Link>

        {categories.map((category) => (
          <Link
            key={category._id}
            to={`/productlistings/${category._id}`}
            onClick={closeMenus}
          >
            {category.categoryName ||
              category.name ||
              category.title ||
              "Category"}
          </Link>
        ))}
      </nav>
    </header>
  );
}
