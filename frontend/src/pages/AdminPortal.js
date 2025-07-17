
import React, { useState } from 'react';
import { Eye, EyeOff, Loader, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserManagement from '../components/admin/UserManagement';

const AdminPortal = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in and is admin, show dashboard
  React.useEffect(() => {
    if (user && user.role === 'admin') {
      setShowDashboard(true);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await login(formData);

      // Check if user is admin, staff, doctor, or pharmacist
      const allowedRoles = ["admin", "staff", "doctor", "pharmacist"];
      if (!allowedRoles.includes(response.user.role)) {
        setError("Access denied. This portal is for staff members only.");
        return;
      }

      // Redirect based on role
      switch (response.user.role) {
        case "admin":
          window.location.href = "/admin/dashboard";
          break;
        case "doctor":
          window.location.href = "/doctor/dashboard";
          break;
        case "staff":
          window.location.href = "/staff/dashboard";
          break;
        case "pharmacist":
          window.location.href = "/pharmacy/dashboard";
          break;
        case "mental_health_consultant":
          window.location.href = "/mental-health/dashboard";
        default:
          window.location.href = "/dashboard";
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // If showing dashboard, render UserManagement
  if (showDashboard && user?.role === 'admin') {
    return <UserManagement />;
  }

  // Otherwise show login form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
// <<<<<<< sandaru
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">
//             Staff Portal
//           </h1>
//           <p className="text-gray-600">
//             Sign in to access the ElderLink staff dashboard
//           </p>
// =======
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-blue-100">Sign in to access the ElderLink admin dashboard</p>

        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin@elderlink.com"
                required
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
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In to Admin Portal</span>
              )}
            </button>
          </form>

          {/* Sample Credentials for Development */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
// <<<<<<< sandaru
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Sample Credentials (Development):
            </h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>
                <strong>Admin:</strong> admin@elderlink.com / Admin@123456
              </div>
              <div>
                <strong>Doctor:</strong> dr.johnson@elderlink.com / Doctor@123
              </div>
              <div>
                <strong>Staff:</strong> jessica.thompson@elderlink.com /
                Staff@123
              </div>
            </div>
          </div>
        </div>

        {/* Back to Main Site */}
        <div className="text-center mt-6">
          <a href="/" className="text-sm text-gray-600 hover:text-gray-800">
            ← Back to ElderLink Home
          </a>
        </div>
// =======
//             <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Admin Credentials:</h4>
//             <div className="text-xs text-gray-600 space-y-1">
//               <div 
//                 className="cursor-pointer hover:bg-gray-100 p-2 rounded"
//                 onClick={() => setFormData({email: 'admin@elderlink.com', password: 'Admin@123456'})}
//               >
//                 <strong>Admin:</strong> admin@elderlink.com / Admin@123456
//               </div>
//             </div>
//           </div>
//         </div>
// >>>>>>> main
      </div>
    </div>
  );
};

export default AdminPortal;
