
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const formatPrice = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);

  return Number.isNaN(parsed.getTime())
    ? "Date unavailable"
    : parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("WearVeirdToken");

      if (!token) {
        throw new Error("Please log in to view your orders.");
      }

      const response = await fetch(`${API_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load your orders.");
      }

      setOrders(
        Array.isArray(data)
          ? data
          : Array.isArray(data.orders)
            ? data.orders
            : []
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <main className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Orders & Purchases</h2>
          <p className="text-muted mb-0">
            View and track your previous orders.
          </p>
        </div>

        <Link to="/" className="btn btn-outline-dark">
          Continue Shopping
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status" />
          <p className="mt-3">Loading your orders...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <p className="mb-2">{error}</p>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={fetchOrders}
          >
            Try Again
          </button>
          {error.includes("log in") && (
            <Link to="/login" className="btn btn-dark btn-sm ms-2">
              Log In
            </Link>
          )}
        </div>
      ) : orders.length === 0 ? (
        <div className="card border-0 shadow-sm text-center p-5">
          <h4>No orders yet</h4>
          <p className="text-muted">
            Your purchases will appear here after you place an order.
          </p>
          <div>
            <Link to="/productlistings" className="btn btn-dark">
              Start Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {orders.map((order) => (
            <div
              key={order._id}
              className="card border-0 shadow-sm"
            >
              <div className="card-body p-4">
                <div className="d-flex flex-wrap justify-content-between gap-3">
                  <div>
                    <h5 className="fw-bold mb-2">
                      Order #{String(order._id).slice(-8).toUpperCase()}
                    </h5>
                    <p className="text-muted mb-1">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                    <p className="mb-0">
                      Status:{" "}
                      <span className="badge bg-secondary">
                        {order.orderStatus || "Processing"}
                      </span>
                    </p>
                  </div>

                  <div className="text-md-end">
                    <h5 className="fw-bold">
                      {formatPrice(order.totalAmount)}
                    </h5>
                    <Link
                      to={`/orderSummary/${order._id}`}
                      className="btn btn-outline-dark btn-sm mt-2"
                    >
                      View Order Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
