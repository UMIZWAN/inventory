import React, { useState } from "react";
import logo from '../assets/image/universal group - black logo.jpg';
import { useAuth } from "../context/AuthContext";
import { router, Head } from "@inertiajs/react";

const Login = () => {
  const { login } = useAuth(); // use login from context
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await login(email, password);

      if (!result.success) {
        setError(result.message);
      } else {
        router.visit("/items/item-list");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex justify-center items-center px-4"
      style={{ fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}
    >
      <Head title="Login" />

      {/* Loading overlay */}
      {submitting && (
        <div
          className="fixed inset-0 z-50 flex justify-center items-center"
          style={{ backgroundColor: "rgba(18, 24, 40, 0.55)" }}
        >
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent" />
        </div>
      )}

      {/* Split card */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* Left panel */}
        <div className="md:w-1/2 bg-gradient-to-br from-blue-700 to-blue-600 text-white p-8 lg:p-10">
          <span className="inline-block border border-white/40 bg-white/10 text-white text-xs font-medium px-3 py-1 rounded-full mb-6">
            Marketing workspace
          </span>

          <h1 className="text-3xl font-bold mb-4">Marketing Inventory System</h1>

          <p className="text-blue-100 mb-6">
            A cleaner, modern workspace for stock, branches, and transaction follow-up.
          </p>

          <ul className="space-y-2 text-sm text-blue-50">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Real-time stock across branches
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Faster receive, transfer, and invoicing
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Full transaction history and reports
            </li>
          </ul>
        </div>

        {/* Right panel */}
        <div className="md:w-1/2 p-8 lg:p-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">Sign in</h2>
          <p className="text-gray-500 text-sm mb-6">Use your MIS account to continue.</p>

          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email or Username
              </label>
              <input
                id="email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Keep me logged in for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white text-base font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
