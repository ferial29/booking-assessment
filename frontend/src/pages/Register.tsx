import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function register(e: any) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
        name,
        email,
        password,
      });
      setSuccess("Account created! Redirecting...");

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setTimeout(() => navigate("/rooms"), 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">

      <div className="backdrop-blur-xl bg-white/50 shadow-2xl rounded-3xl p-10 w-full max-w-md animate-fadeIn">

        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Create an Account
        </h1>

        {error && <p className="text-red-600 mb-3 text-center">{error}</p>}
        {success && <p className="text-green-600 mb-3 text-center">{success}</p>}

        <form onSubmit={register} className="space-y-5">

          <input
            className="w-full p-3 border rounded-xl shadow-md focus:ring-2 focus:ring-blue-500"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            className="w-full p-3 border rounded-xl shadow-md focus:ring-2 focus:ring-blue-500"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="w-full p-3 border rounded-xl shadow-md focus:ring-2 focus:ring-blue-500"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition transform hover:scale-105">
            Register
          </button>
        </form>

        <p className="mt-6 text-center text-gray-700">
          Already have an account?
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            {" "}Login
          </span>
        </p>
      </div>
    </div>
  );
}
