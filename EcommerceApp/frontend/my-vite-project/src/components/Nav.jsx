
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
  FaSignOutAlt,
  FaChevronDown,
  FaTimes,
} from "react-icons/fa";
import { useAuth } from "../contexts/authContext";
import "./Nav.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function Nav({ setSearchText }) {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openCategoryId, setOpenCategoryId] = useState(null);

  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const accountRef = useRef(null);
  const categoryNavRef = useRef(null);

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

      if (
        categoryNavRef.current &&
        !categoryNavRef.current.contains(event.target)
      ) {
        setOpenCategoryId(null);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setAccountOpen(false);
        setMobileOpen(false);
        setOpenCategoryId(null);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function closeMenus() {
    setAccountOpen(false);
    setMobileOpen(false);
    setOpenCategoryId(null);
  }

  function handleSearch(event) {
    event.preventDefault();
    setSearchText?.(search.trim());
    navigate("/productlistings");
    closeMenus();
  }

  function handleLogout() {
    logout();
    closeMenus();
    navigate("/", { replace: true });
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

  const parentCategories = categories.filter(
    (category) => !category.parentCategory
  );

  function getSubcategories(parentId) {
    return categories.filter((category) => {
      const parentIdValue =
        category.parentCategory?._id || category.parentCategory;

      return (
        parentIdValue &&
        String(parentIdValue) === String(parentId)
      );
    });
  }

  function handleCategoryToggle(categoryId) {
    setOpenCategoryId((currentId) =>
      currentId === categoryId ? null : categoryId
    );
  }

  function handleCategoryMouseEnter(categoryId) {
    if (window.matchMedia("(min-width: 901px)").matches) {
      setOpenCategoryId(categoryId);
    }
  }

  function handleCategoryMouseLeave() {
    if (window.matchMedia("(min-width: 901px)").matches) {
      setOpenCategoryId(null);
    }
  }

  return (
    <header className="WearVeird-navbar">
      <div className="WearVeird-navbar-main">
        <Link
          to="/"
          className="WearVeird-brand"
          onClick={closeMenus}
          aria-label="WearVeird home"
        >
          <span className="WearVeird-brand-icon">
            <FaShoppingBag />
          </span>
          <span>WearVeird</span>
        </Link>

        <form
          className="WearVeird-search"
          onSubmit={handleSearch}
          role="search"
        >
          <FaSearch className="WearVeird-search-icon" />

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
              className="WearVeird-search-clear"
              aria-label="Clear search"
              onClick={() => {
                setSearch("");
                setSearchText?.("");
              }}
            >
              <FaTimes />
            </button>
          )}

          <button
            type="submit"
            className="WearVeird-search-submit"
          >
            Search
          </button>
        </form>

        <div className="WearVeird-navbar-actions">
          <Link
            to="/wishlist"
            className="WearVeird-header-action"
            aria-label="Wishlist"
            onClick={closeMenus}
          >
            <span className="WearVeird-header-action-icon">
              <FaHeart />
            </span>
            <span>Wishlist</span>
          </Link>

          <Link
            to="/cart"
            className="WearVeird-header-action"
            aria-label="Shopping cart"
            onClick={closeMenus}
          >
            <span className="WearVeird-header-action-icon">
              <FaShoppingCart />
            </span>
            <span>Cart</span>
          </Link>

          <div
            className="WearVeird-account-wrapper"
            ref={accountRef}
          >
            <button
              type="button"
              className={`WearVeird-account-trigger ${
                accountOpen ? "is-open" : ""
              }`}
              onClick={() => setAccountOpen((open) => !open)}
              aria-expanded={accountOpen}
              aria-haspopup="true"
              aria-label="Open account menu"
            >
              <span className="WearVeird-user-avatar">
                {user ? initials : <FaUser />}
              </span>

              <span className="WearVeird-account-trigger-text">
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

              <FaChevronDown className="WearVeird-account-chevron" />
            </button>

            {accountOpen && (
              <div className="WearVeird-account-dropdown">
                <div className="WearVeird-dropdown-header">
                  <span className="WearVeird-dropdown-avatar">
                    {user ? initials : <FaUser />}
                  </span>

                  <div className="WearVeird-dropdown-identity">
                    <strong>
                      {user?.name || "Welcome to WearVeird"}
                    </strong>
                    <span>
                      {user?.email ||
                        "Sign in to manage your account"}
                    </span>
                  </div>
                </div>

                {!loading && (
                  <>
                    {user ? (
                      <>
                        <div className="WearVeird-dropdown-section-label">
                          MY ACCOUNT
                        </div>

                        <Link
                          to="/profile"
                          className="WearVeird-dropdown-item"
                          onClick={closeMenus}
                        >
                          <FaUser />
                          <span>My Profile</span>
                        </Link>

                        <Link
                          to="/orderSummary"
                          className="WearVeird-dropdown-item"
                          onClick={closeMenus}
                        >
                          <FaBoxOpen />
                          <span>Orders &amp; Purchases</span>
                        </Link>

                        <Link
                          to="/addressDetails"
                          className="WearVeird-dropdown-item"
                          onClick={closeMenus}
                        >
                          <FaMapMarkerAlt />
                          <span>My Addresses</span>
                        </Link>

                        <div className="WearVeird-dropdown-divider" />

                        <div className="WearVeird-dropdown-section-label">
                          GENERAL
                        </div>

                        <a
                          href="mailto:support@WearVeird.com?subject=WearVeird%20Feedback"
                          className="WearVeird-dropdown-item"
                          onClick={closeMenus}
                        >
                          <FaCommentDots />
                          <span>Feedback</span>
                        </a>

                        <a
                          href="mailto:support@WearVeird.com"
                          className="WearVeird-dropdown-item"
                          onClick={closeMenus}
                        >
                          <FaHeadset />
                          <span>Contact Us &amp; Support</span>
                        </a>

                        <div className="WearVeird-dropdown-divider" />

                        <button
                          type="button"
                          className="WearVeird-dropdown-item WearVeird-dropdown-logout"
                          onClick={handleLogout}
                        >
                          <FaSignOutAlt />
                          <span>Logout</span>
                        </button>
                      </>
                    ) : (
                      <div className="WearVeird-dropdown-auth">
                        <Link
                          to="/login"
                          className="WearVeird-dropdown-login"
                          onClick={closeMenus}
                        >
                          Login
                        </Link>

                        <Link
                          to="/register"
                          className="WearVeird-dropdown-register"
                          onClick={closeMenus}
                        >
                          Create an Account
                        </Link>
                      </div>
                    )}
                  </>
                )}

                <div className="WearVeird-dropdown-footer">
                  WearVeird · Your everyday marketplace
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="WearVeird-mobile-toggle"
            aria-label={
              mobileOpen ? "Close navigation" : "Open navigation"
            }
            aria-expanded={mobileOpen}
            onClick={() => {
              setMobileOpen((open) => !open);
              setOpenCategoryId(null);
            }}
          >
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      <nav
        ref={categoryNavRef}
        className={`WearVeird-category-nav ${
          mobileOpen ? "WearVeird-category-nav-open" : ""
        }`}
        aria-label="Product categories"
      >
        <div className="WearVeird-category-inner">
          <Link
            to="/productlistings"
            className="WearVeird-category-link"
            onClick={closeMenus}
          >
            All Products
          </Link>

          {parentCategories.map((category) => {
            const subcategories = getSubcategories(category._id);
            const isOpen = openCategoryId === category._id;

            return (
              <div
                key={category._id}
                className={`WearVeird-category-group ${
                  isOpen ? "WearVeird-category-group-open" : ""
                }`}
                onMouseEnter={() =>
                  handleCategoryMouseEnter(category._id)
                }
                onMouseLeave={handleCategoryMouseLeave}
              >
                <div className="WearVeird-category-heading">
                  <Link
                    to={`/productlistings/${category._id}`}
                    className="WearVeird-category-link"
                    onClick={closeMenus}
                  >
                    {category.name}
                  </Link>

                  {subcategories.length > 0 && (
                    <button
                      type="button"
                      className="WearVeird-category-toggle"
                      aria-label={`Toggle ${category.name} subcategories`}
                      aria-expanded={isOpen}
                      onClick={() =>
                        handleCategoryToggle(category._id)
                      }
                    >
                      <FaChevronDown />
                    </button>
                  )}
                </div>

                {subcategories.length > 0 && (
                  <div
                    className="WearVeird-subcategory-dropdown"
                    hidden={!isOpen}
                  >
                    {subcategories.map((subcategory) => (
                      <Link
                        key={subcategory._id}
                        to={`/productlistings/${subcategory._id}`}
                        onClick={closeMenus}
                      >
                        {subcategory.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
