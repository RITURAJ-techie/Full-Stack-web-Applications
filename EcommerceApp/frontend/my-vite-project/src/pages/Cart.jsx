
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaHeart,
  FaMinus,
  FaPlus,
  FaShieldAlt,
  FaShoppingBag,
  FaTrashAlt,
  FaTruck,
} from "react-icons/fa";
import toast from "react-hot-toast";
import useCartContext from "../contexts/cartContext";
import useWishListContext from "../contexts/wishlistContext";

const formatPrice = (amount) =>
  `₹${Math.round(amount).toLocaleString("en-IN")}`;

const getDiscountedUnitPrice = (item) => {
  const price = Number(item.price) || 0;
  const discount = Math.min(
    50,
    Math.max(0, Number(item.discountedPrice) || 0)
  );

  return Math.round(price * (1 - discount / 100));
};

export default function Cart() {
  const {
    allCartItems,
    DecreaseQty,
    IncreaseQty,
    deleteCartItem,
  } = useCartContext();

  const { updateWishList } = useWishListContext();
  const navigate = useNavigate();

  const itemCount = allCartItems.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0
  );

  const subtotal = allCartItems.reduce(
    (total, item) =>
      total + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );

  const discountedSubtotal = allCartItems.reduce(
    (total, item) =>
      total +
      getDiscountedUnitPrice(item) * (Number(item.quantity) || 0),
    0
  );

  const savings = subtotal - discountedSubtotal;
  const deliveryCharge = allCartItems.length > 0 ? 100 : 0;
  const finalAmount = discountedSubtotal + deliveryCharge;

  function handleCheckout() {
    if (allCartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    navigate("/checkout");
  }

  function handleRemove(itemId) {
    deleteCartItem(itemId);
    toast.success("Item removed from cart");
  }

  function handleMoveToWishlist(item) {
    updateWishList(item);
    deleteCartItem(item._id);
    toast.success("Moved to wishlist");
  }

  return (
    <main className="shopnest-cart-page">
      <div className="shopnest-cart-container">
        <div className="shopnest-cart-heading">
          <div>
            <p className="shopnest-cart-eyebrow">YOUR SHOPPING BAG</p>
            <h1>My Cart <span>({itemCount})</span></h1>
            <p className="shopnest-cart-subtitle">
              Review your picks before you check out.
            </p>
          </div>

          <Link
            to="/productlistings"
            className="shopnest-cart-continue-link"
          >
            <FaArrowLeft /> Continue shopping
          </Link>
        </div>

        {allCartItems.length === 0 ? (
          <section className="shopnest-cart-empty">
            <div className="shopnest-cart-empty-icon">
              <FaShoppingBag />
            </div>
            <h2>Your bag is taking a little break</h2>
            <p>
              You haven't added anything yet. Explore the collection and find
              something you love.
            </p>
            <Link
              to="/productlistings"
              className="shopnest-cart-shop-button"
            >
              Explore products <FaArrowRight />
            </Link>
          </section>
        ) : (
          <div className="shopnest-cart-layout">
            <section className="shopnest-cart-items-section">
              <div className="shopnest-cart-section-heading">
                <h2>Your items</h2>
                <span>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
              </div>

              <div className="shopnest-cart-items">
                {allCartItems.map((item) => {
                  const quantity = Number(item.quantity) || 1;
                  const discount = Math.min(
                    50,
                    Math.max(0, Number(item.discountedPrice) || 0)
                  );
                  const unitPrice = getDiscountedUnitPrice(item);
                  const lineTotal = unitPrice * quantity;
                  const lineSavings =
                    ((Number(item.price) || 0) - unitPrice) * quantity;

                  return (
                    <article
                      className="shopnest-cart-item"
                      key={`${item._id}-${item.selectedSize || "One Size"}`}
                    >
                      <Link
                        to={`/productDetails/${item._id}`}
                        className="shopnest-cart-image-link"
                        aria-label={`View ${item.productName}`}
                      >
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="shopnest-cart-image"
                          onError={(event) => {
                            event.currentTarget.style.visibility = "hidden";
                          }}
                        />
                      </Link>

                      <div className="shopnest-cart-item-info">
                        <div className="shopnest-cart-item-top">
                          <div>
                            <Link
                              to={`/productDetails/${item._id}`}
                              className="shopnest-cart-product-name"
                            >
                              {item.productName}
                            </Link>

                            <p className="shopnest-cart-size">
                              Size:{" "}
                              <strong>
                                {item.selectedSize &&
                                item.selectedSize !== "Not Selected"
                                  ? item.selectedSize
                                  : "One Size"}
                              </strong>
                            </p>
                          </div>

                          <button
                            type="button"
                            className="shopnest-cart-remove-icon"
                            onClick={() => handleRemove(item._id)}
                            aria-label={`Remove ${item.productName}`}
                            title="Remove item"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>

                        <div className="shopnest-cart-prices">
                          <strong>{formatPrice(lineTotal)}</strong>

                          {discount > 0 && (
                            <>
                              <span className="shopnest-cart-original-price">
                                {formatPrice((Number(item.price) || 0) * quantity)}
                              </span>
                              <span className="shopnest-cart-discount">
                                {discount}% OFF
                              </span>
                            </>
                          )}
                        </div>

                        {lineSavings > 0 && (
                          <p className="shopnest-cart-item-savings">
                            You save {formatPrice(lineSavings)}
                          </p>
                        )}

                        <div className="shopnest-cart-item-bottom">
                          <div className="shopnest-cart-quantity">
                            <button
                              type="button"
                              onClick={() => DecreaseQty(item._id)}
                              disabled={quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              <FaMinus />
                            </button>
                            <span>{quantity}</span>
                            <button
                              type="button"
                              onClick={() => IncreaseQty(item._id)}
                              aria-label="Increase quantity"
                            >
                              <FaPlus />
                            </button>
                          </div>

                          <button
                            type="button"
                            className="shopnest-cart-wishlist-action"
                            onClick={() => handleMoveToWishlist(item)}
                          >
                            <FaHeart /> Move to wishlist
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="shopnest-cart-trust-note">
                <FaShieldAlt />
                <span>Your selections are saved in this browser.</span>
              </div>
            </section>

            <aside className="shopnest-cart-summary">
              <h2>Order summary</h2>
              <p className="shopnest-cart-summary-subtitle">
                A little overview before checkout.
              </p>

              <div className="shopnest-cart-summary-line">
                <span>Subtotal ({itemCount} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="shopnest-cart-summary-line shopnest-cart-savings-line">
                <span>Product discounts</span>
                <span>− {formatPrice(savings)}</span>
              </div>

              <div className="shopnest-cart-summary-line">
                <span>Delivery charges</span>
                <span>
                  {deliveryCharge === 0
                    ? "Free"
                    : formatPrice(deliveryCharge)}
                </span>
              </div>

              <div className="shopnest-cart-delivery-note">
                <FaTruck />
                <span>Delivery charges are included in your total.</span>
              </div>

              <div className="shopnest-cart-summary-total">
                <span>Total payable</span>
                <strong>{formatPrice(finalAmount)}</strong>
              </div>

              <p className="shopnest-cart-total-savings">
                {savings > 0
                  ? `You're saving ${formatPrice(savings)} on these products.`
                  : "Discover products with special offers."}
              </p>

              <button
                type="button"
                className="shopnest-cart-checkout-button"
                onClick={handleCheckout}
              >
                Proceed to checkout <FaArrowRight />
              </button>

              <button
                type="button"
                className="shopnest-cart-address-button"
                onClick={() => navigate("/addressDetails")}
              >
                + Manage delivery address
              </button>

              <div className="shopnest-cart-secure-note">
                <FaShieldAlt />
                <span>Review your order details before placing your order.</span>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
