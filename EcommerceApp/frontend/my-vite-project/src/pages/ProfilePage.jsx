
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/authContext";

const BASE_URL = import.meta.env.VITE_API_URL;

const formatPrice = (amount) =>
  `₹${Math.round(Number(amount) || 0).toLocaleString("en-IN")}`;

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  return Number.isNaN(parsedDate.getTime())
    ? "Date unavailable"
    : parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

export default function ProfilePage() {
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user, logout } = useAuth();

  const fetchProfileData = useCallback(async () => {
    const token = localStorage.getItem("WearVeirdToken");

    if (!token) {
      setError("Your session has expired. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [ordersResponse, addressesResponse] = await Promise.all([
        fetch(`${BASE_URL}/api/orders`, { headers }),
        fetch(`${BASE_URL}/api/address`, { headers }),
      ]);

      if (
        ordersResponse.status === 401 ||
        ordersResponse.status === 403 ||
        addressesResponse.status === 401 ||
        addressesResponse.status === 403
      ) {
        logout();
        window.location.assign("/login");
        return;
      }

      const [ordersData, addressesData] = await Promise.all([
        ordersResponse.json(),
        addressesResponse.json(),
      ]);

      if (!ordersResponse.ok) {
        throw new Error(
          ordersData.error || "Unable to load your order history."
        );
      }

      if (!addressesResponse.ok) {
        throw new Error(
          addressesData.error || "Unable to load your saved addresses."
        );
      }

      setOrders(
        Array.isArray(ordersData)
          ? ordersData
          : Array.isArray(ordersData.orders)
            ? ordersData.orders
            : []
      );

      setAddresses(
        Array.isArray(addressesData)
          ? addressesData
          : Array.isArray(addressesData.addresses)
            ? addressesData.addresses
            : []
      );
    } catch (fetchError) {
      console.error("Error fetching profile data:", fetchError);
      setError(fetchError.message || "Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-dark" role="status" />
        <p className="mt-3">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center py-5">
        <div className="alert alert-danger">{error}</div>
        <button
          type="button"
          className="btn btn-dark me-2"
          onClick={fetchProfileData}
        >
          Try again
        </button>
        <Link to="/" className="btn btn-outline-dark">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <main className="container mt-5 mb-5">
      <Link
        to="/addressDetails"
        className="text-decoration-none text-dark"
      >
        <div className="card shadow-sm border-0 mb-5 p-4">
          <h3 className="fw-bold">My Profile</h3>
          <p className="text-muted mb-0">
            {user?.name
              ? `Welcome back, ${user.name}!`
              : "Manage your addresses and track your orders"}
          </p>
        </div>
      </Link>

      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">Saved Addresses</h4>
          <Link to="/addressDetails" className="btn btn-outline-dark btn-sm">
            Manage addresses
          </Link>
        </div>

        {addresses.length === 0 ? (
          <div className="alert alert-secondary">
            No saved addresses found. Add an address to make checkout easier.
          </div>
        ) : (
          <div className="row">
            {addresses.map((item) => (
              <div key={item._id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body">
                    <h6 className="fw-bold">{item.name}</h6>
                    <p className="text-muted mb-1">{item.email}</p>
                    <p className="mb-1">{item.address}</p>
                    <p className="mb-1">📞 {item.phone}</p>
                    <p className="mb-0">📍 {item.pincode}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h4 className="mb-4">Order History</h4>

        {orders.length === 0 ? (
          <div className="alert alert-secondary">
            No orders placed yet. Your future purchases will appear here.
          </div>
        ) : (
          <div className="card shadow-sm border-0">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="fw-semibold">
                        {String(order._id).slice(-8).toUpperCase()}
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td className="fw-bold">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td>
                        <span className="badge bg-success">
                          {order.orderStatus || "Processing"}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/orderSummary/${order._id}`}
                          className="btn btn-sm btn-outline-dark"
                        >
                          View order
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
