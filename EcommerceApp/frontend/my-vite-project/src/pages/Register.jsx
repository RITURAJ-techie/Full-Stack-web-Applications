
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/authContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await register(name, email, password);
      toast.success("Your WearVeird account is ready!");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="WearVeird-auth-page">
      <form className="WearVeird-auth-card" onSubmit={handleSubmit}>
        <p className="WearVeird-auth-eyebrow">JOIN WearVeird</p>
        <h1>Create your account</h1>
        <p className="WearVeird-auth-description">
          Create an account for a better shopping experience.
        </p>

        <label htmlFor="register-name">Full name</label>
        <input
          id="register-name"
          type="text"
          autoComplete="name"
          minLength={2}
          maxLength={80}
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />

        <label htmlFor="register-email">Email address</label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </button>

        <p className="WearVeird-auth-footer">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </main>
  );
}
