
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaHeart,
  FaRegHeart,
  FaShieldAlt,
  FaShoppingBag,
  FaStar,
  FaTruck,
  FaUndo,
  FaMinus,
  FaPlus,
} from "react-icons/fa";
import toast from "react-hot-toast";
import useFetch from "../useFetch";
import useCartContext from "../contexts/cartContext";
import useWishListContext from "../contexts/wishlistContext";

export default function ProductDetails() {
  const { productId } = useParams();
  const { data, loading } = useFetch(
    `${import.meta.env.VITE_API_URL}/api/products/${productId}`,
    null
  );

  const { updateCartItem } = useCartContext();
  const { allWishListItem, updateWishList, deleteWishListItem } =
    useWishListContext();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("Not Selected");

  if (loading) {
    return (
      <main className="shopnest-details-page">
        <div className="shopnest-details-loading">
          <div className="shopnest-details-loading-image" />
          <div className="shopnest-details-loading-copy">
            <div />
            <div />
            <div />
            <div />
          </div>
        </div>
      </main>
    );
  }

  if (!data || !data._id) {
    return (
      <main className="shopnest-details-page">
        <div className="shopnest-details-message">
          <span>Product unavailable</span>
          <p>We couldn't find this product. It may have been removed.</p>
          <Link to="/productlistings" className="shopnest-details-back">
            <FaArrowLeft /> Browse products
          </Link>
        </div>
      </main>
    );
  }

  const sizes = Array.isArray(data.size) ? data.size : [];
  const discountPercent = Math.min(
    50,
    Math.max(0, Number(data.discountedPrice) || 0)
  );
  const finalPrice = Math.round(data.price * (1 - discountPercent / 100));
  const isWishlisted = allWishListItem.some(
    (item) => item._id === data._id
  );

  function handleWishlist() {
    if (isWishlisted) {
      deleteWishListItem(data._id);
      toast("Removed from wishlist", { icon: "♡" });
    } else {
      updateWishList(data);
      toast.success("Added to wishlist");
    }
  }

  function handleAddToCart() {
    if (sizes.length > 0 && selectedSize === "Not Selected") {
      toast.error("Please select a size");
      return;
    }

    updateCartItem(
      data,
      quantity,
      sizes.length > 0 ? selectedSize : "One Size"
    );
    toast.success("Added to cart");
  }

  return (
    <main className="shopnest-details-page">
      <div className="shopnest-details-container">
        <nav className="shopnest-details-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/productlistings">Products</Link>
          <span>/</span>
          <span className="shopnest-details-current">
            {data.productName}
          </span>
        </nav>

        <section className="shopnest-details-layout">
          <div className="shopnest-details-gallery">
            <div className="shopnest-details-image-wrap">
              {discountPercent > 0 && (
                <span className="shopnest-details-discount">
                  {discountPercent}% OFF
                </span>
              )}

              <button
                type="button"
                className={`shopnest-details-wishlist ${
                  isWishlisted ? "is-active" : ""
                }`}
                onClick={handleWishlist}
                aria-label={
                  isWishlisted
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
              >
                {isWishlisted ? <FaHeart /> : <FaRegHeart />}
              </button>

              <img
                className="shopnest-details-image"
                src={data.productImage}
                alt={data.productName}
                onError={(event) => {
                  event.currentTarget.style.visibility = "hidden";
                }}
              />
            </div>

            <div className="shopnest-details-image-caption">
              <FaCheckCircle />
              <span>Thoughtfully selected for your everyday needs</span>
            </div>
          </div>

          <div className="shopnest-details-info">
            <p className="shopnest-details-eyebrow">SHOPNEST COLLECTION</p>

            <h1 className="shopnest-details-title">{data.productName}</h1>

            <div className="shopnest-details-rating">
              <span className="shopnest-details-rating-value">
                <FaStar />{" "}
                {Number(data.rating) > 0
                  ? Number(data.rating).toFixed(1)
                  : "New"}
              </span>
              <span className="shopnest-details-rating-copy">
                {Number(data.rating) > 0
                  ? "Product rating"
                  : "Be the first to discover it"}
              </span>
            </div>

            <div className="shopnest-details-price-block">
              <span className="shopnest-details-price">
                ₹{finalPrice.toLocaleString("en-IN")}
              </span>

              {discountPercent > 0 && (
                <>
                  <span className="shopnest-details-original-price">
                    ₹{Number(data.price).toLocaleString("en-IN")}
                  </span>
                  <span className="shopnest-details-savings">
                    Save ₹{(Number(data.price) - finalPrice).toLocaleString("en-IN")}
                  </span>
                </>
              )}
            </div>

            <p className="shopnest-details-tax-note">
              Inclusive of listed price
            </p>

            <div className="shopnest-details-divider" />

            <div className="shopnest-details-description">
              <h2>Product details</h2>
              <p>{data.description}</p>
            </div>

            {sizes.length > 0 && (
              <div className="shopnest-details-size-section">
                <div className="shopnest-details-section-heading">
                  <h2>Select size</h2>
                  <span>
                    {selectedSize !== "Not Selected"
                      ? `Selected: ${selectedSize}`
                      : "Choose an option"}
                  </span>
                </div>

                <div className="shopnest-details-sizes">
                  {sizes.map((size) => (
                    <button
                      type="button"
                      key={size}
                      className={`shopnest-size-button ${
                        selectedSize === size ? "is-selected" : ""
                      }`}
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={selectedSize === size}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="shopnest-details-quantity-section">
              <h2>Quantity</h2>
              <div className="shopnest-quantity-control">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <FaMinus />
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => current + 1)}
                  aria-label="Increase quantity"
                >
                  <FaPlus />
                </button>
              </div>
            </div>

            <div className="shopnest-details-actions">
              <button
                type="button"
                className="shopnest-details-add-cart"
                onClick={handleAddToCart}
              >
                <FaShoppingBag />
                Add to Cart
              </button>

              <button
                type="button"
                className={`shopnest-details-wishlist-action ${
                  isWishlisted ? "is-active" : ""
                }`}
                onClick={handleWishlist}
                aria-label={
                  isWishlisted
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
              >
                {isWishlisted ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>

            <div className="shopnest-details-benefits">
              <div>
                <FaTruck />
                <span>
                  <strong>Convenient delivery</strong>
                  <small>Delivery options at checkout</small>
                </span>
              </div>
              <div>
                <FaUndo />
                <span>
                  <strong>Return information</strong>
                  <small>Check eligibility before ordering</small>
                </span>
              </div>
              <div>
                <FaShieldAlt />
                <span>
                  <strong>Secure checkout</strong>
                  <small>Your order details stay protected</small>
                </span>
              </div>
            </div>

            <Link
              to="/productlistings"
              className="shopnest-details-continue"
            >
              <FaArrowLeft /> Continue shopping
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
