import React, { useState } from "react";
import logo from '../assets/image/universal group - black logo.jpg';
import { useAuth } from "../context/AuthContext";
import { router, Head } from "@inertiajs/react";

const Login = () => {
  const { login } = useAuth(); // use login from context
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const result = await login(email, password);

    if (!result.success) {
      setError(result.message);
    } else {
      console.log("Login success!");
      router.visit("/items/item-list");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center bg-gray-50 overflow-hidden">
      <Head title="Login" />
      {/* Background SVG Circles */}
      <div className="absolute inset-0 z-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 800 800">
          <g fillOpacity="0.22">
            <circle fill="rgba(59,130,246,0.1)" cx="400" cy="400" r="600" />
            <circle fill="rgba(59,130,246,0.2)" cx="400" cy="400" r="500" />
            <circle fill="rgba(59,130,246,0.3)" cx="400" cy="400" r="300" />
            <circle fill="rgba(59,130,246,0.4)" cx="400" cy="400" r="200" />
            <circle fill="rgba(59,130,246,0.5)" cx="400" cy="400" r="100" />
          </g>
        </svg>
      </div>

      {/* <div className="flex justify-center mb-20">
        <img src={logo} alt="logo" className="h-9" />
      </div> */}

      <div className="relative z-10 max-w-md w-full mx-auto p-6 bg-white shadow-xl rounded-xl">
        {/* Logo */}
        <div className="flex justify-center items-center py-4 bg-blue-600 rounded-t-xl">
          <h1 className="text-white font-bold uppercase tracking-wider">Marketing Inventory System</h1>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <h4 className="text-xl font-bold text-gray-800">Sign In</h4>
            <p className="text-gray-500 text-sm">
              Enter your email address and password
            </p>
          </div>

          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                {/* <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot your password?
                </a> */}
              </div>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mb-4">
              {/* <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox text-blue-600"
                  defaultChecked
                />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label> */}
            </div>

            <div className="mb-0 mt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
              >
                Log In
              </button>
            </div>
          </form>
        </div>

        {/* <div className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?
          <a href="/register" className="ml-1 text-blue-600 font-medium hover:underline">
            Sign Up
          </a>
        </div> */}
      </div>

      <footer className="mt-6 text-center text-xs text-gray-400 z-10">
        {/* 2018 - {new Date().getFullYear()} © Hyper - Coderthemes.com */}
      </footer>
    </div>
  );
};

export default Login;
