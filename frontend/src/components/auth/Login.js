// src/components/auth/Login.js
import React, { useState } from "react";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = ({ onClose, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  // Universal redirect function based on user role
  const redirectUserBasedOnRole = (user) => {
    let redirectPath = "/dashboard"; // default

    switch (user.role) {
      case "admin":
        redirectPath = "/admin/dashboard";
        break;
      case "doctor":
        redirectPath = "/doctor/dashboard";
        break;
      case "coordinator":
        redirectPath = "/coordinator/dashboard";
        break;
      case "ambulance_driver":
        redirectPath = "/driver/dashboard";
        break;
      case "staff":
        redirectPath = "/staff/dashboard";
        break;

      case "pharmacist":
        redirectPath = "/pharmacist/dashboard";

        break;
      case "mental_health_consultant":
        redirectPath = "/mental-health/dashboard";
        break;
      case "family_member":
        redirectPath = "/family/dashboard";
        break;
      case "elder":
        redirectPath = "/elder/dashboard";
        break;
      default:
        redirectPath = "/family/dashboard";
    }

    // Use React Router navigate instead of window.location.href
    navigate(redirectPath);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission and page reload
    e.stopPropagation(); // Stop event bubbling

    setError("");
    setIsLoading(true);

    try {
      console.log("Attempting login with:", formData.email);
      const response = await login(formData);
      console.log("Login successful:", response);

      // Close modal if it exists
      if (onClose) {
        onClose();
      }

      // Redirect based on user role
      redirectUserBasedOnRole(response.user);
    } catch (error) {
      console.error("Login error:", error);
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
            autoComplete="email"
            placeholder="Enter your email"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading || !formData.email || !formData.password}
          className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>

        {/* Only show register option for family members (on landing page) */}
        {onSwitchToRegister && (
          <div className="text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-red-500 hover:text-red-600 font-medium"
                disabled={isLoading}
              >
                Create one
              </button>
            </p>
          </div>
        )}

        {/* Sample credentials for development (you can remove this in production) */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs">
          <details>
            <summary className="cursor-pointer font-medium text-gray-700 mb-2">
              Sample Login Credentials (Development Only)
            </summary>
            <div className="space-y-2 text-gray-600">
              <div
                className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                onClick={() =>
                  setFormData({
                    email: "admin@elderlink.com",
                    password: "Admin@123456",
                  })
                }
              >
                <strong>Admin:</strong> admin@elderlink.com / Admin@123456
              </div>
              <div
                className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                onClick={() =>
                  setFormData({
                    email: "dr.johnson@elderlink.com",
                    password: "Doctor@123",
                  })
                }
              >
                <strong>Doctor:</strong> dr.johnson@elderlink.com / Doctor@123
              </div>
              <div
                className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                onClick={() =>
                  setFormData({
                    email: "jessica.thompson@elderlink.com",
                    password: "Staff@123",
                  })
                }
              >
                <strong>Staff:</strong> jessica.thompson@elderlink.com /
                Staff@123
              </div>
              <div
                className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                onClick={() =>
                  setFormData({
                    email: "pharmacist.lee@elderlink.com",
                    password: "Pharm@123",
                  })
                }
              >
                <strong>Pharmacist:</strong> pharmacist.lee@elderlink.com /
                Pharm@123
              </div>
              <div
                className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                onClick={() =>
                  setFormData({
                    email: "john.smith@example.com",
                    password: "Family@123",
                  })
                }
              >
                <strong>Family:</strong> john.smith@example.com / Family@123
              </div>
            </div>
          </details>
        </div>
      </form>
    </div>
  );
};

export default Login;
