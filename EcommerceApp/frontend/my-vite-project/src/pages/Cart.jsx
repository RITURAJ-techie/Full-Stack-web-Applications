
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
    <main className="WearVeird-cart-page">
      <div className="WearVeird-cart-container">
        <div className="WearVeird-cart-heading">
          <div>
            <p className="WearVeird-cart-eyebrow">YOUR SHOPPING BAG</p>
            <h1>My Cart <span>({itemCount})</span></h1>
            <p className="WearVeird-cart-subtitle">
              Review your picks before you check out.
            </p>
          </div>

          <Link
            to="/productlistings"
            className="WearVeird-cart-continue-link"
          >
            <FaArrowLeft /> Continue shopping
          </Link>
        </div>

        {allCartItems.length === 0 ? (
          <section className="WearVeird-cart-empty">
            <div className="WearVeird-cart-empty-icon">
              <FaShoppingBag />
            </div>
            <h2>Your bag is taking a little break</h2>
            <p>
              You haven't added anything yet. Explore the collection and find
              something you love.
            </p>
            <Link
              to="/productlistings"
              className="WearVeird-cart-shop-button"
            >
              Explore products <FaArrowRight />
            </Link>
          </section>
        ) : (
          <div className="WearVeird-cart-layout">
            <section className="WearVeird-cart-items-section">
              <div className="WearVeird-cart-section-heading">
                <h2>Your items</h2>
                <span>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
              </div>

              <div className="WearVeird-cart-items">
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
                      className="WearVeird-cart-item"
                      key={`${item._id}-${item.selectedSize || "One Size"}`}
                    >
                      <Link
                        to={`/productDetails/${item._id}`}
                        className="WearVeird-cart-image-link"
                        aria-label={`View ${item.productName}`}
                      >
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="WearVeird-cart-image"
                          onError={(event) => {
                            event.currentTarget.style.visibility = "hidden";
                          }}
                        />
                      </Link>

                      <div className="WearVeird-cart-item-info">
                        <div className="WearVeird-cart-item-top">
                          <div>
                            <Link
                              to={`/productDetails/${item._id}`}
                              className="WearVeird-cart-product-name"
                            >
                              {item.productName}
                            </Link>

                            <p className="WearVeird-cart-size">
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
                            className="WearVeird-cart-remove-icon"
                            onClick={() => handleRemove(item._id)}
                            aria-label={`Remove ${item.productName}`}
                            title="Remove item"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>

                        <div className="WearVeird-cart-prices">
                          <strong>{formatPrice(lineTotal)}</strong>

                          {discount > 0 && (
                            <>
                              <span className="WearVeird-cart-original-price">
                                {formatPrice((Number(item.price) || 0) * quantity)}
                              </span>
                              <span className="WearVeird-cart-discount">
                                {discount}% OFF
                              </span>
                            </>
                          )}
                        </div>

                        {lineSavings > 0 && (
                          <p className="WearVeird-cart-item-savings">
                            You save {formatPrice(lineSavings)}
                          </p>
                        )}

                        <div className="WearVeird-cart-item-bottom">
                          <div className="WearVeird-cart-quantity">
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
                            className="WearVeird-cart-wishlist-action"
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

              <div className="WearVeird-cart-trust-note">
                <FaShieldAlt />
                <span>Your selections are saved in this browser.</span>
              </div>
            </section>

            <aside className="WearVeird-cart-summary">
              <h2>Order summary</h2>
              <p className="WearVeird-cart-summary-subtitle">
                A little overview before checkout.
              </p>

              <div className="WearVeird-cart-summary-line">
                <span>Subtotal ({itemCount} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="WearVeird-cart-summary-line WearVeird-cart-savings-line">
                <span>Product discounts</span>
                <span>− {formatPrice(savings)}</span>
              </div>

              <div className="WearVeird-cart-summary-line">
                <span>Delivery charges</span>
                <span>
                  {deliveryCharge === 0
                    ? "Free"
                    : formatPrice(deliveryCharge)}
                </span>
              </div>

              <div className="WearVeird-cart-delivery-note">
                <FaTruck />
                <span>Delivery charges are included in your total.</span>
              </div>

              <div className="WearVeird-cart-summary-total">
                <span>Total payable</span>
                <strong>{formatPrice(finalAmount)}</strong>
              </div>

              <p className="WearVeird-cart-total-savings">
                {savings > 0
                  ? `You're saving ${formatPrice(savings)} on these products.`
                  : "Discover products with special offers."}
              </p>

              <button
                type="button"
                className="WearVeird-cart-checkout-button"
                onClick={handleCheckout}
              >
                Proceed to checkout <FaArrowRight />
              </button>

              <button
                type="button"
                className="WearVeird-cart-address-button"
                onClick={() => navigate("/addressDetails")}
              >
                + Manage delivery address
              </button>

              <div className="WearVeird-cart-secure-note">
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
