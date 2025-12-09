import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  async function login(e: any) {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:4000/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") navigate("/dashboard");
      else navigate("/rooms");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      
      <div className="backdrop-blur-xl bg-white/50 shadow-2xl rounded-3xl p-10 w-full max-w-md animate-fadeIn">

        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Login
        </h1>

        {error && (
          <p className="text-red-600 text-center mb-4">{error}</p>
        )}

        <form onSubmit={login} className="space-y-5">

          <input
            className="w-full p-3 border rounded-xl shadow-md focus:ring-2 focus:ring-blue-500"
            placeholder="Email Address"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full p-3 border rounded-xl shadow-md focus:ring-2 focus:ring-blue-500"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition transform hover:scale-105"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-gray-700">
          Don’t have an account?
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate("/register")}
          >
            {" "}Register
          </span>
        </p>
      </div>
    </div>
  );
}
