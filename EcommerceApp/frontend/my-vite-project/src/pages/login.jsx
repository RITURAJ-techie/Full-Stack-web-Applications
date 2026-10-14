
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/authContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await login(email, password);
      toast.success("Welcome back to WearVeird!");

      const destination = location.state?.from;
      const safePath =
        destination?.pathname?.startsWith("/") &&
        !destination.pathname.startsWith("//")
          ? destination.pathname
          : "/";

      navigate(safePath, { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="WearVeird-auth-page">
      <form className="WearVeird-auth-card" onSubmit={handleSubmit}>
        <p className="WearVeird-auth-eyebrow">WELCOME BACK</p>
        <h1>Login to WearVeird</h1>
        <p className="WearVeird-auth-description">
          Sign in to continue shopping.
        </p>

        <label htmlFor="login-email">Email address</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Login"}
        </button>

        <p className="WearVeird-auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </main>
  );
}
