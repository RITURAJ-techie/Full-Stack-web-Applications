import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowRight,
  FaCheck,
  FaCheckCircle,
  FaClipboardList,
  FaHome,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaShoppingBag,
  FaTruck,
} from "react-icons/fa";

const formatPrice = (amount) =>
  `₹${Math.round(Number(amount) || 0).toLocaleString("en-IN")}`;

export default function OrderSummary() {
  const [latestOrder, setLatestOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const navigate = useNavigate();
  const { orderId } = useParams();

  useEffect(() => {
    let isMounted = true;

    async function fetchOrder() {
      const token = localStorage.getItem("shopnestToken");

      if (!token) {
        navigate("/login", {
          replace: true,
          state: { from: `/orderSummary/${orderId || ""}` },
        });
        return;
      }

      if (!orderId) {
        setFetchError("The order reference is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setFetchError("");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/orders/${encodeURIComponent(orderId)}`,
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
              state: { from: `/orderSummary/${orderId}` },
            });

            return;
          }

          throw new Error(
            data?.error ||
              data?.message ||
              "Unable to retrieve your order."
          );
        }

        const order = data?.order || data;

        if (!order?._id) {
          throw new Error("The server returned an invalid order.");
        }

        if (isMounted) {
          setLatestOrder(order);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Order summary error:", error);
          setFetchError(
            error.message || "Could not load your order details."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [navigate, orderId]);

  if (loading) {
    return (
      <main className="shopnest-order-page">
        <div className="shopnest-order-loading">
          <div className="shopnest-order-loading-icon" />
          <div className="shopnest-order-loading-line" />
          <div className="shopnest-order-loading-line short" />
          <p>Getting your order details ready...</p>
        </div>
      </main>
    );
  }

  if (fetchError) {
    return (
      <main className="shopnest-order-page">
        <section className="shopnest-order-empty">
          <div className="shopnest-order-empty-icon">
            <FaClipboardList />
          </div>

          <h1>We couldn't load your order</h1>
          <p>{fetchError}</p>

          <button
            type="button"
            className="shopnest-order-primary-button"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>

          <div style={{ marginTop: "16px" }}>
            <Link to="/profile">View your account</Link>
          </div>
        </section>
      </main>
    );
  }

  if (!latestOrder) {
    return (
      <main className="shopnest-order-page">
        <section className="shopnest-order-empty">
          <div className="shopnest-order-empty-icon">
            <FaShoppingBag />
          </div>

          <h1>No order found</h1>
          <p>
            We couldn't find this order. It may not exist or may not be
            accessible to your account.
          </p>

          <Link
            to="/productlistings"
            className="shopnest-order-primary-button"
          >
            Explore products <FaArrowRight />
          </Link>
        </section>
      </main>
    );
  }

  const address = latestOrder.address || {};
  const items = Array.isArray(latestOrder.items)
    ? latestOrder.items
    : [];

  const orderDate = latestOrder.createdAt
    ? new Date(latestOrder.createdAt)
    : null;

  const validOrderDate =
    orderDate && !Number.isNaN(orderDate.getTime());

  const itemCount = items.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0
  );

  const subtotal = Number(latestOrder.subtotal) || 0;
  const discountAmount = Number(latestOrder.discountAmount) || 0;
  const deliveryCharge = Number(latestOrder.deliveryCharge) || 0;
  const totalAmount = Number(latestOrder.totalAmount) || 0;

  return (
    <main className="shopnest-order-page">
      <div className="shopnest-order-container">
        <section className="shopnest-order-success">
          <div className="shopnest-order-success-icon">
            <FaCheck />
          </div>

          <p className="shopnest-order-eyebrow">
            THANK YOU FOR SHOPPING WITH US
          </p>

          <h1>
            {latestOrder.orderStatus === "Cancelled"
              ? "Your order has been cancelled"
              : "Your order is confirmed!"}
          </h1>

          <p className="shopnest-order-success-copy">
            Thanks for choosing ShopNest. Your order details are ready
            below.
          </p>

          <div className="shopnest-order-status">
            <FaCheckCircle />
            <span>
              Status:{" "}
              <strong>
                {latestOrder.orderStatus || "Confirmed"}
              </strong>
            </span>
          </div>

          <p style={{ marginTop: "12px" }}>
            Order ID: <strong>{latestOrder._id}</strong>
          </p>
        </section>

        <section className="shopnest-order-progress">
          <div className="shopnest-order-progress-step is-complete">
            <span>
              <FaCheck />
            </span>
            <div>
              <strong>Order placed</strong>
              <small>Order received</small>
            </div>
          </div>

          <div className="shopnest-order-progress-line" />

          <div
            className={`shopnest-order-progress-step ${
              ["Processing", "Shipped", "Delivered"].includes(
                latestOrder.orderStatus
              )
                ? "is-complete"
                : ""
            }`}
          >
            <span>
              <FaClipboardList />
            </span>
            <div>
              <strong>Processing</strong>
              <small>Order preparation</small>
            </div>
          </div>

          <div className="shopnest-order-progress-line" />

          <div
            className={`shopnest-order-progress-step ${
              ["Shipped", "Delivered"].includes(
                latestOrder.orderStatus
              )
                ? "is-complete"
                : ""
            }`}
          >
            <span>
              <FaTruck />
            </span>
            <div>
              <strong>Delivery</strong>
              <small>Shipment progress</small>
            </div>
          </div>
        </section>

        <div className="shopnest-order-layout">
          <section className="shopnest-order-card">
            <div className="shopnest-order-card-heading">
              <div>
                <p className="shopnest-order-card-eyebrow">
                  ORDER DETAILS
                </p>
                <h2>Your items</h2>
              </div>

              <span className="shopnest-order-item-count">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>

            {validOrderDate && (
              <p className="shopnest-order-date">
                Placed on{" "}
                {orderDate.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}

            <div className="shopnest-order-items">
              {items.map((item, index) => {
                const quantity = Number(item.quantity) || 1;
                const price = Number(item.price) || 0;
                const discount = Math.min(
                  50,
                  Math.max(0, Number(item.discountPercent) || 0)
                );

                const unitPrice = Math.round(
                  price * (1 - discount / 100)
                );

                return (
                  <div
                    className="shopnest-order-item"
                    key={`${item.productId || item._id || item.productName}-${item.selectedSize || "One Size"}-${index}`}
                  >
                    <div className="shopnest-order-item-image-wrap">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productName || "Ordered product"}
                          className="shopnest-order-item-image"
                          onError={(event) => {
                            event.currentTarget.style.visibility = "hidden";
                          }}
                        />
                      ) : (
                        <FaShoppingBag />
                      )}
                    </div>

                    <div className="shopnest-order-item-info">
                      <strong>{item.productName || "Product"}</strong>

                      <p>
                        Size:{" "}
                        {item.selectedSize &&
                        item.selectedSize !== "Not Selected"
                          ? item.selectedSize
                          : "One Size"}
                      </p>

                      <p>Quantity: {quantity}</p>

                      {discount > 0 && (
                        <small>{discount}% discount applied</small>
                      )}
                    </div>

                    <strong className="shopnest-order-item-total">
                      {formatPrice(unitPrice * quantity)}
                    </strong>
                  </div>
                );
              })}
            </div>

            <div className="shopnest-order-card-footer">
              <FaShieldAlt />
              <span>Keep this page for your order reference.</span>
            </div>
          </section>

          <aside className="shopnest-order-sidebar">
            <section className="shopnest-order-card shopnest-order-address-card">
              <div className="shopnest-order-card-heading">
                <div>
                  <p className="shopnest-order-card-eyebrow">
                    DELIVERY
                  </p>
                  <h2>Shipping address</h2>
                </div>

                <FaMapMarkerAlt className="shopnest-order-heading-icon" />
              </div>

              <div className="shopnest-order-address">
                <strong>{address.name || "Recipient"}</strong>
                <p>{address.address || "Address not available"}</p>

                {address.phone && <p>Phone: {address.phone}</p>}
                {address.email && <p>{address.email}</p>}
                {address.pincode && <p>PIN: {address.pincode}</p>}
              </div>

              <div className="shopnest-order-address-note">
                <FaTruck />
                <span>
                  Delivery details are associated with this order.
                </span>
              </div>
            </section>

            <section className="shopnest-order-card shopnest-order-payment-card">
              <p className="shopnest-order-card-eyebrow">
                ORDER SUMMARY
              </p>

              <h2>Payment summary</h2>

              <div className="shopnest-order-payment-line">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>

              <div className="shopnest-order-payment-line">
                <span>Discount</span>
                <strong>− {formatPrice(discountAmount)}</strong>
              </div>

              <div className="shopnest-order-payment-line">
                <span>Delivery</span>
                <strong>{formatPrice(deliveryCharge)}</strong>
              </div>

              <div className="shopnest-order-payment-line">
                <span>Total amount</span>
                <strong>{formatPrice(totalAmount)}</strong>
              </div>

              <div className="shopnest-order-payment-note">
                This total was recorded by the order API.
              </div>
            </section>
          </aside>
        </div>

        <section className="shopnest-order-next-actions">
          <div>
            <h2>What's next?</h2>
            <p>
              You can continue exploring ShopNest or return to your
              account.
            </p>
          </div>

          <div className="shopnest-order-action-buttons">
            <button
              type="button"
              className="shopnest-order-secondary-button"
              onClick={() => navigate("/")}
            >
              <FaHome /> Home
            </button>

            <Link
              to="/productlistings"
              className="shopnest-order-primary-button"
            >
              Continue shopping <FaArrowRight />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}