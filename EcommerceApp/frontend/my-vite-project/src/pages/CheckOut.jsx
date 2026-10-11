import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaShoppingBag,
  FaTruck,
} from "react-icons/fa";
import toast from "react-hot-toast";
import useCartContext from "../contexts/cartContext";

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

export default function Checkout() {
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [savedAddress, setSavedAddress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addressError, setAddressError] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const { allCartItems, clearCart } = useCartContext();
  const navigate = useNavigate();

  const addresses = Array.isArray(savedAddress) ? savedAddress : [];

  const selectedAddress = addresses.find(
    (address) => address._id === selectedAddressId
  );

  useEffect(() => {
    let isMounted = true;

    async function fetchAddresses() {
      const token = localStorage.getItem("shopnestToken");

      if (!token) {
        navigate("/login", {
          replace: true,
          state: { from: "/checkout" },
        });
        return;
      }

      try {
        setLoading(true);
        setAddressError("");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/address`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("shopnestToken");
            navigate("/login", {
              replace: true,
              state: { from: "/checkout" },
            });
            return;
          }

          throw new Error(
            data?.message || "Unable to load your saved addresses."
          );
        }

        if (isMounted) {
          const addresses = Array.isArray(data)
            ? data
            : Array.isArray(data?.addresses)
              ? data.addresses
              : [];

          setSavedAddress(addresses);
        }
      } catch (error) {
        if (isMounted) {
          setAddressError(
            error.message || "Unable to load your saved addresses."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchAddresses();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const itemCount = allCartItems.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0
  );

  const subtotal = allCartItems.reduce(
    (total, item) =>
      total +
      (Number(item.price) || 0) * (Number(item.quantity) || 0),
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

  async function handleOrderPlaced() {
    if (isPlacingOrder) return;

    if (allCartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    const token = localStorage.getItem("shopnestToken");

    if (!token) {
      toast.error("Please log in to place your order.");
      navigate("/login", {
        state: { from: "/checkout" },
      });
      return;
    }

    const orderData = {
      items: allCartItems.map((item) => ({
        productId: item.productId || item._id,
        quantity: Number(item.quantity),
        selectedSize:
          item.selectedSize && item.selectedSize !== "Not Selected"
            ? item.selectedSize
            : null,
      })),
      address: {
        name: selectedAddress.name,
        email: selectedAddress.email,
        address: selectedAddress.address,
        phone: selectedAddress.phone,
        pincode: selectedAddress.pincode,
      },
    };

    setIsPlacingOrder(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("shopnestToken");
          toast.error("Your session has expired. Please log in again.");
          navigate("/login", {
            state: { from: "/checkout" },
          });
          return;
        }
        console.error("Order API status:", response.status);
        console.error("Order API response:", data);
        console.error("Order payload:", orderData);
        throw new Error(
          data?.message || "Order could not be placed."
        );
      }

      if (!data?.order?._id) {
        throw new Error(
          "The server did not return the created order. Please verify your orders before trying again."
        );
      }

      clearCart();

      toast.success("Order placed successfully!");

      navigate("/orderSummary", {
        state: {
          order: data.order,
        },
      });
    } catch (error) {
      toast.error(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsPlacingOrder(false);
    }
  }

  return (
    <main className="shopnest-checkout-page">
      <div className="shopnest-checkout-container">
        <Link to="/cart" className="shopnest-checkout-back">
          <FaArrowLeft /> Back to cart
        </Link>

        <header className="shopnest-checkout-heading">
          <p className="shopnest-checkout-eyebrow">ALMOST YOURS</p>
          <h1>Checkout</h1>
          <p>Confirm your delivery details and review your order.</p>
        </header>

        <div className="shopnest-checkout-layout">
          <div className="shopnest-checkout-main">
            <section className="shopnest-checkout-card">
              <div className="shopnest-checkout-section-heading">
                <span className="shopnest-checkout-step">01</span>

                <div>
                  <h2>Delivery address</h2>
                  <p>Where should we deliver your order?</p>
                </div>
              </div>

              {loading ? (
                <div className="shopnest-checkout-status">
                  Loading your saved addresses...
                </div>
              ) : addressError ? (
                <div className="shopnest-checkout-status">
                  <p>{addressError}</p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                  >
                    Try again
                  </button>
                </div>
              ) : addresses.length === 0 ? (
                <div className="shopnest-checkout-no-address">
                  <FaMapMarkerAlt />

                  <div>
                    <strong>No saved addresses yet</strong>
                    <p>Add a delivery address to continue.</p>
                  </div>

                  <Link to="/addressDetails">
                    Add address <FaArrowRight />
                  </Link>
                </div>
              ) : (
                <>
                  <label
                    className="shopnest-checkout-label"
                    htmlFor="checkout-address"
                  >
                    Choose a saved address
                  </label>

                  <select
                    id="checkout-address"
                    className="shopnest-checkout-select"
                    value={selectedAddressId}
                    onChange={(event) =>
                      setSelectedAddressId(event.target.value)
                    }
                  >
                    <option value="">Select delivery address</option>

                    {addresses.map((address) => (
                      <option key={address._id} value={address._id}>
                        {address.name} — {address.pincode}
                      </option>
                    ))}
                  </select>

                  {selectedAddress && (
                    <div className="shopnest-checkout-selected-address">
                      <div className="shopnest-checkout-address-icon">
                        <FaMapMarkerAlt />
                      </div>

                      <div className="shopnest-checkout-address-info">
                        <div className="shopnest-checkout-address-name">
                          <strong>{selectedAddress.name}</strong>
                          <FaCheckCircle />
                        </div>

                        <p>{selectedAddress.address}</p>
                        <p>Phone: {selectedAddress.phone}</p>

                        <p>
                          {selectedAddress.email
                            ? `${selectedAddress.email} · `
                            : ""}
                          PIN: {selectedAddress.pincode}
                        </p>
                      </div>
                    </div>
                  )}

                  <Link
                    to="/addressDetails"
                    className="shopnest-checkout-add-address"
                  >
                    + Manage saved addresses
                  </Link>
                </>
              )}
            </section>

            <section className="shopnest-checkout-card">
              <div className="shopnest-checkout-section-heading">
                <span className="shopnest-checkout-step">02</span>

                <div>
                  <h2>Review your items</h2>
                  <p>
                    {itemCount} item{itemCount !== 1 ? "s" : ""} in your order
                  </p>
                </div>
              </div>

              {allCartItems.length === 0 ? (
                <div className="shopnest-checkout-status">
                  Your cart is empty.{" "}
                  <Link to="/productlistings">Browse products</Link>
                </div>
              ) : (
                <div className="shopnest-checkout-items">
                  {allCartItems.map((item) => {
                    const quantity = Number(item.quantity) || 0;

                    const discount = Math.min(
                      50,
                      Math.max(0, Number(item.discountedPrice) || 0)
                    );

                    const unitPrice = getDiscountedUnitPrice(item);

                    return (
                      <div
                        className="shopnest-checkout-item"
                        key={`${item._id}-${item.selectedSize || "One Size"}`}
                      >
                        <Link
                          to={`/productDetails/${item._id}`}
                          className="shopnest-checkout-item-image-wrap"
                        >
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="shopnest-checkout-item-image"
                            onError={(event) => {
                              event.currentTarget.style.visibility = "hidden";
                            }}
                          />
                        </Link>

                        <div className="shopnest-checkout-item-info">
                          <Link
                            to={`/productDetails/${item._id}`}
                            className="shopnest-checkout-item-name"
                          >
                            {item.productName}
                          </Link>

                          <p>
                            Size:{" "}
                            {item.selectedSize &&
                            item.selectedSize !== "Not Selected"
                              ? item.selectedSize
                              : "One Size"}
                          </p>

                          <p>Quantity: {quantity}</p>

                          {discount > 0 && (
                            <span className="shopnest-checkout-item-discount">
                              {discount}% off
                            </span>
                          )}
                        </div>

                        <strong className="shopnest-checkout-item-price">
                          {formatPrice(unitPrice * quantity)}
                        </strong>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <aside className="shopnest-checkout-summary">
            <h2>Order summary</h2>

            <p className="shopnest-checkout-summary-subtitle">
              Here's what you'll pay today.
            </p>

            <div className="shopnest-checkout-summary-line">
              <span>Subtotal ({itemCount} items)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            <div className="shopnest-checkout-summary-line shopnest-checkout-savings">
              <span>Product discounts</span>
              <span>− {formatPrice(savings)}</span>
            </div>

            <div className="shopnest-checkout-summary-line">
              <span>Delivery charges</span>
              <span>{formatPrice(deliveryCharge)}</span>
            </div>

            <div className="shopnest-checkout-total">
              <span>Total payable</span>
              <strong>{formatPrice(finalAmount)}</strong>
            </div>

            {savings > 0 && (
              <div className="shopnest-checkout-saving-note">
                You're saving {formatPrice(savings)} on your products.
              </div>
            )}

            <button
              type="button"
              className="shopnest-checkout-place-order"
              onClick={handleOrderPlaced}
              disabled={
                isPlacingOrder ||
                allCartItems.length === 0 ||
                loading ||
                Boolean(addressError) ||
                addresses.length === 0
              }
            >
              {isPlacingOrder ? (
                "Placing your order..."
              ) : (
                <>
                  Place order <FaArrowRight />
                </>
              )}
            </button>

            <div className="shopnest-checkout-secure">
              <FaShieldAlt />
              <span>Review your details before confirming your order.</span>
            </div>

            <div className="shopnest-checkout-delivery">
              <FaTruck />
              <span>
                Delivery arrangements will be confirmed with your order.
              </span>
            </div>

            <Link to="/cart" className="shopnest-checkout-edit-cart">
              <FaShoppingBag /> Edit cart
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}