
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
      <main className="WearVeird-details-page">
        <div className="WearVeird-details-loading">
          <div className="WearVeird-details-loading-image" />
          <div className="WearVeird-details-loading-copy">
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
      <main className="WearVeird-details-page">
        <div className="WearVeird-details-message">
          <span>Product unavailable</span>
          <p>We couldn't find this product. It may have been removed.</p>
          <Link to="/productlistings" className="WearVeird-details-back">
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
    <main className="WearVeird-details-page">
      <div className="WearVeird-details-container">
        <nav className="WearVeird-details-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/productlistings">Products</Link>
          <span>/</span>
          <span className="WearVeird-details-current">
            {data.productName}
          </span>
        </nav>

        <section className="WearVeird-details-layout">
          <div className="WearVeird-details-gallery">
            <div className="WearVeird-details-image-wrap">
              {discountPercent > 0 && (
                <span className="WearVeird-details-discount">
                  {discountPercent}% OFF
                </span>
              )}

              <button
                type="button"
                className={`WearVeird-details-wishlist ${
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
                className="WearVeird-details-image"
                src={data.productImage}
                alt={data.productName}
                onError={(event) => {
                  event.currentTarget.style.visibility = "hidden";
                }}
              />
            </div>

            <div className="WearVeird-details-image-caption">
              <FaCheckCircle />
              <span>Thoughtfully selected for your everyday needs</span>
            </div>
          </div>

          <div className="WearVeird-details-info">
            <p className="WearVeird-details-eyebrow">WearVeird COLLECTION</p>

            <h1 className="WearVeird-details-title">{data.productName}</h1>

            <div className="WearVeird-details-rating">
              <span className="WearVeird-details-rating-value">
                <FaStar />{" "}
                {Number(data.rating) > 0
                  ? Number(data.rating).toFixed(1)
                  : "New"}
              </span>
              <span className="WearVeird-details-rating-copy">
                {Number(data.rating) > 0
                  ? "Product rating"
                  : "Be the first to discover it"}
              </span>
            </div>

            <div className="WearVeird-details-price-block">
              <span className="WearVeird-details-price">
                ₹{finalPrice.toLocaleString("en-IN")}
              </span>

              {discountPercent > 0 && (
                <>
                  <span className="WearVeird-details-original-price">
                    ₹{Number(data.price).toLocaleString("en-IN")}
                  </span>
                  <span className="WearVeird-details-savings">
                    Save ₹{(Number(data.price) - finalPrice).toLocaleString("en-IN")}
                  </span>
                </>
              )}
            </div>

            <p className="WearVeird-details-tax-note">
              Inclusive of listed price
            </p>

            <div className="WearVeird-details-divider" />

            <div className="WearVeird-details-description">
              <h2>Product details</h2>
              <p>{data.description}</p>
            </div>

            {sizes.length > 0 && (
              <div className="WearVeird-details-size-section">
                <div className="WearVeird-details-section-heading">
                  <h2>Select size</h2>
                  <span>
                    {selectedSize !== "Not Selected"
                      ? `Selected: ${selectedSize}`
                      : "Choose an option"}
                  </span>
                </div>

                <div className="WearVeird-details-sizes">
                  {sizes.map((size) => (
                    <button
                      type="button"
                      key={size}
                      className={`WearVeird-size-button ${
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

            <div className="WearVeird-details-quantity-section">
              <h2>Quantity</h2>
              <div className="WearVeird-quantity-control">
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

            <div className="WearVeird-details-actions">
              <button
                type="button"
                className="WearVeird-details-add-cart"
                onClick={handleAddToCart}
              >
                <FaShoppingBag />
                Add to Cart
              </button>

              <button
                type="button"
                className={`WearVeird-details-wishlist-action ${
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

            <div className="WearVeird-details-benefits">
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
              className="WearVeird-details-continue"
            >
              <FaArrowLeft /> Continue shopping
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
