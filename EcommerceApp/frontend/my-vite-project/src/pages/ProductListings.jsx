import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { FaHeart, FaRegHeart, FaShoppingBag, FaStar } from "react-icons/fa";
import useFetch from "../useFetch";
import useCartContext from "../contexts/cartContext";
import useWishListContext from "../contexts/wishlistContext";
import toast from "react-hot-toast";

function ProductSkeleton() {
  return (
    <div className="WearVeird-product-grid">
      {Array.from({ length: 8 }, (_, index) => (
        <div className="WearVeird-product-skeleton" key={index}>
          <div className="WearVeird-skeleton-image" />
          <div className="WearVeird-skeleton-line" />
          <div className="WearVeird-skeleton-line short" />
          <div className="WearVeird-skeleton-button" />
        </div>
      ))}
    </div>
  );
}

export default function ProductListings() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { updateCartItem } = useCartContext();
  const { allWishListItem, updateWishList, deleteWishListItem } =
    useWishListContext();

  const [selectedRating, setSelectedRating] = useState(null);
  const [selectSortBy, setSelectSortBy] = useState("");
  const [givenPrice, setGivenPrice] = useState(5000);

  const searchText =
    new URLSearchParams(location.search).get("search")?.trim() || "";

  const {
    data: categories,
    loading: categoriesLoading,
  } = useFetch(`${import.meta.env.VITE_API_URL}/api/categories`);

  const {
    data: products,
    loading,
    error,
  } = useFetch(
    categoryId
      ? `${import.meta.env.VITE_API_URL}/api/products/categories/${categoryId}`
      : `${import.meta.env.VITE_API_URL}/api/products`,
  );

  const wishlistIds = useMemo(
    () => new Set((allWishListItem || []).map((item) => item._id)),
    [allWishListItem],
  );

  const result = useMemo(() => {
    let filtered = Array.isArray(products) ? [...products] : [];

    if (searchText) {
      const query = searchText.toLowerCase();
      filtered = filtered.filter((product) =>
        product.productName?.toLowerCase().includes(query),
      );
    }

    if (selectedRating !== null) {
      filtered = filtered.filter(
        (product) => Number(product.rating || 0) >= selectedRating,
      );
    }

    filtered = filtered.filter(
      (product) => Number(product.price || 0) <= givenPrice,
    );

    if (selectSortBy === "low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (selectSortBy === "high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (selectSortBy === "rating") {
      filtered.sort(
        (a, b) => Number(b.rating || 0) - Number(a.rating || 0),
      );
    }

    return filtered;
  }, [products, searchText, selectedRating, givenPrice, selectSortBy]);

  function handleAddToCart(item) {
    updateCartItem(item, 1, "Not Selected");
    toast.success("Added to cart");
  }

  function handleWishlist(item) {
    if (wishlistIds.has(item._id)) {
      deleteWishListItem(item._id);
      toast("Removed from wishlist", { icon: "♡" });
    } else {
      updateWishList(item);
      toast.success("Added to wishlist");
    }
  }

  function handleCategoryChange(nextCategoryId) {
    const query = new URLSearchParams(location.search).toString();
    const path = nextCategoryId
      ? `/productlistings/${nextCategoryId}`
      : "/productlistings";

    navigate(query ? `${path}?${query}` : path);
  }

  function clearFilters() {
    setSelectedRating(null);
    setSelectSortBy("");
    setGivenPrice(5000);
  }

  function getFinalPrice(product) {
    const discount = Math.min(
      50,
      Math.max(0, Number(product.discountedPrice) || 0),
    );

    return Math.round(Number(product.price) * (1 - discount / 100));
  }

  const selectedCategory = Array.isArray(categories)
    ? categories.find((category) => category._id === categoryId)
    : null;

  return (
    <main className="WearVeird-marketplace">
      <section className="WearVeird-marketplace-heading">
        <div>
          <p className="WearVeird-eyebrow">THE WearVeird EDIT</p>
          <h1>{searchText ? "Search results" : selectedCategory?.name || "All products"}</h1>
          <p className="WearVeird-heading-description">
            {searchText
              ? `Discover products matching “${searchText}”.`
              : "Thoughtful picks for your everyday style."}
          </p>
        </div>

        <div className="WearVeird-results-count">
          {!loading && `${result.length} products`}
        </div>
      </section>

      <div className="WearVeird-marketplace-layout">
        <aside className="WearVeird-filter-panel">
          <div className="WearVeird-filter-heading">
            <h2>Filters</h2>
            <button type="button" onClick={clearFilters}>
              Reset
            </button>
          </div>

          <div className="WearVeird-filter-section">
            <h3>Category</h3>
            <button
              type="button"
              className={`WearVeird-category-filter ${
                !categoryId ? "active" : ""
              }`}
              onClick={() => handleCategoryChange("")}
            >
              All products
            </button>

            {categoriesLoading ? (
              <p className="WearVeird-filter-muted">Loading categories…</p>
            ) : (
              (Array.isArray(categories) ? categories : []).map((category) => (
                <button
                  type="button"
                  key={category._id}
                  className={`WearVeird-category-filter ${
                    categoryId === category._id ? "active" : ""
                  }`}
                  onClick={() => handleCategoryChange(category._id)}
                >
                  {category.name}
                  {categoryId === category._id && (
                    <span aria-hidden="true">✓</span>
                  )}
                </button>
              ))
            )}
          </div>

          <div className="WearVeird-filter-section">
            <div className="WearVeird-filter-label-row">
              <h3>Maximum price</h3>
              <span>₹{givenPrice.toLocaleString("en-IN")}</span>
            </div>

            <input
              className="WearVeird-price-range"
              type="range"
              min="100"
              max="5000"
              step="100"
              value={givenPrice}
              onChange={(event) => setGivenPrice(Number(event.target.value))}
              aria-label="Maximum price"
            />

            <div className="WearVeird-range-labels">
              <span>₹100</span>
              <span>₹5,000</span>
            </div>
          </div>

          <div className="WearVeird-filter-section">
            <h3>Customer rating</h3>

            {[4, 3, 2, 1].map((rating) => (
              <label className="WearVeird-rating-option" key={rating}>
                <input
                  type="radio"
                  name="rating"
                  checked={selectedRating === rating}
                  onChange={() => setSelectedRating(rating)}
                />
                <span>{rating}+ stars</span>
              </label>
            ))}

            {selectedRating !== null && (
              <button
                type="button"
                className="WearVeird-clear-rating"
                onClick={() => setSelectedRating(null)}
              >
                Clear rating
              </button>
            )}
          </div>

          <div className="WearVeird-filter-section">
            <h3>Sort products</h3>
            <select
              className="WearVeird-sort-select"
              value={selectSortBy}
              onChange={(event) => setSelectSortBy(event.target.value)}
              aria-label="Sort products"
            >
              <option value="">Recommended</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>
        </aside>

        <section className="WearVeird-products-section">
          <div className="WearVeird-products-toolbar">
            <div>
              <span className="WearVeird-toolbar-label">SHOP THE COLLECTION</span>
              <p>
                {loading
                  ? "Finding your products…"
                  : `${result.length} items to explore`}
              </p>
            </div>

            <button
              type="button"
              className="WearVeird-mobile-reset"
              onClick={clearFilters}
            >
              Reset filters
            </button>
          </div>

          {loading ? (
            <ProductSkeleton />
          ) : error ? (
            <div className="WearVeird-empty-state">
              <h2>We couldn't load the products</h2>
              <p>Please check your connection and try again.</p>
              <button type="button" onClick={() => window.location.reload()}>
                Try again
              </button>
            </div>
          ) : result.length === 0 ? (
            <div className="WearVeird-empty-state">
              <div className="WearVeird-empty-icon">
                <FaShoppingBag />
              </div>
              <h2>No products found</h2>
              <p>
                Try changing your search or adjusting your filters to see more
                products.
              </p>
              <button type="button" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="WearVeird-product-grid">
              {result.map((item) => {
                const discount = Math.min(
                  50,
                  Math.max(0, Number(item.discountedPrice) || 0),
                );
                const finalPrice = getFinalPrice(item);
                const isWishlisted = wishlistIds.has(item._id);

                return (
                  <article className="WearVeird-product-card" key={item._id}>
                    <div className="WearVeird-product-image-wrap">
                      <Link
                        to={`/productDetails/${item._id}`}
                        className="WearVeird-product-image-link"
                        aria-label={`View ${item.productName}`}
                      >
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="WearVeird-product-image"
                          loading="lazy"
                        />
                      </Link>

                      {discount > 0 && (
                        <span className="WearVeird-discount-badge">
                          {discount}% OFF
                        </span>
                      )}

                      <button
                        type="button"
                        className={`WearVeird-wishlist-button ${
                          isWishlisted ? "is-wishlisted" : ""
                        }`}
                        onClick={() => handleWishlist(item)}
                        aria-label={
                          isWishlisted
                            ? `Remove ${item.productName} from wishlist`
                            : `Add ${item.productName} to wishlist`
                        }
                      >
                        {isWishlisted ? <FaHeart /> : <FaRegHeart />}
                      </button>
                    </div>

                    <div className="WearVeird-product-info">
                      <div className="WearVeird-product-rating">
                        <FaStar />
                        <span>{Number(item.rating || 0).toFixed(1)}</span>
                      </div>

                      <Link
                        to={`/productDetails/${item._id}`}
                        className="WearVeird-product-name"
                      >
                        {item.productName}
                      </Link>

                      <div className="WearVeird-product-pricing">
                        <span className="WearVeird-current-price">
                          ₹{finalPrice.toLocaleString("en-IN")}
                        </span>

                        {discount > 0 && (
                          <span className="WearVeird-original-price">
                            ₹{Number(item.price).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      {discount > 0 && (
                        <p className="WearVeird-savings">
                          You save ₹
                          {(Number(item.price) - finalPrice).toLocaleString(
                            "en-IN",
                          )}
                        </p>
                      )}

                      <button
                        type="button"
                        className="WearVeird-add-cart-button"
                        onClick={() => handleAddToCart(item)}
                      >
                        <FaShoppingBag />
                        Add to cart
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}