
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

export default function AddressPage() {
  const [editId, setEditId] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    pincode: "",
  });

  const getHeaders = () => {
    const token = localStorage.getItem("shopnestToken");

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/address`, {
        headers: getHeaders(),
      });

      if (response.status === 401 || response.status === 403) {
        toast.error("Your session has expired. Please log in again.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch addresses");
      }

      const data = await response.json();
      setAddresses(Array.isArray(data) ? data : data.addresses ?? []);
    } catch (error) {
      console.error("Fetch addresses error:", error);
      toast.error(error.message || "Unable to load addresses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  function handleChange(e) {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const url = editId
        ? `${API_URL}/api/address/${editId}`
        : `${API_URL}/api/address`;

      const response = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: getHeaders(),
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to save address");
      }

      toast.success(editId ? "Address updated!" : "New address added!");

      setEditId(null);
      setFormData({
        name: "",
        email: "",
        address: "",
        phone: "",
        pincode: "",
      });

      await fetchAddresses();
    } catch (error) {
      console.error("Save address error:", error);
      toast.error(error.message || "Unable to save address");
    }
  }

  function handleUpdate(id) {
    const addressToEdit = addresses.find((item) => item._id === id);

    if (!addressToEdit) return;

    setFormData({
      name: addressToEdit.name || "",
      email: addressToEdit.email || "",
      address: addressToEdit.address || "",
      phone: addressToEdit.phone || "",
      pincode: addressToEdit.pincode || "",
    });

    setEditId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    try {
      const response = await fetch(`${API_URL}/api/address/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete address");
      }

      toast.success("Address deleted!");
      await fetchAddresses();
    } catch (error) {
      console.error("Delete address error:", error);
      toast.error(error.message || "Unable to delete address");
    }
  }

  return (
    <div className="card shadow-sm p-4 mb-5 border-0 bg-light">
      <h4 className="mb-3">
        {editId ? "Edit Address" : "Add New Address"}
      </h4>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6 mb-3">
            <input
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="col-12 mb-3">
            <textarea
              name="address"
              placeholder="Full Address"
              value={formData.address}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <input
              name="phone"
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <input
              name="pincode"
              placeholder="Pincode"
              value={formData.pincode}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-dark">
          {editId ? "Update Address" : "Save Address"}
        </button>

        {editId && (
          <button
            type="button"
            className="btn btn-outline-secondary ms-2"
            onClick={() => {
              setEditId(null);
              setFormData({
                name: "",
                email: "",
                address: "",
                phone: "",
                pincode: "",
              });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <h2 className="mb-4 mt-5">Saved Addresses</h2>

      {loading ? (
        <p>Loading addresses...</p>
      ) : addresses.length === 0 ? (
        <p className="text-muted">No saved addresses yet.</p>
      ) : (
        <div className="row">
          {addresses.map((item) => (
            <div key={item._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card shadow-sm h-100 border-0">
                <div className="card-body">
                  <h5 className="fw-bold">{item.name}</h5>
                  <p className="text-muted mb-1">{item.email}</p>
                  <p className="mb-1">{item.address}</p>
                  <p className="mb-1">📞 {item.phone}</p>
                  <p className="mb-3">📍 {item.pincode}</p>

                  <div className="d-flex justify-content-between">
                    <button
                      type="button"
                      className="btn btn-warning btn-sm"
                      onClick={() => handleUpdate(item._id)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
