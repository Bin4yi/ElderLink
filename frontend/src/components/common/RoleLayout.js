// src/components/common/RoleLayout.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Heart, LogOut } from 'lucide-react';
import { getRoleMenuItems } from '../../utils/roleMenus';

const RoleLayout = ({ children, title }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const menuItems = getRoleMenuItems(user?.role);
  
  // Enhanced active check that handles query parameters
  const isActive = (path) => {
    const [itemPath, itemQuery] = path.split('?');
    const currentPath = location.pathname;
    const currentSearch = location.search;
    
    // If no query params in menu item, just match path
    if (!itemQuery) {
      return currentPath === itemPath;
    }
    
    // If query params exist, match both path and query
    return currentPath === itemPath && currentSearch === `?${itemQuery}`;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-40">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-primary-500" />
              <span className="text-xl font-bold gradient-text">ElderLink</span>
            </div>
          </div>

          {/* User Info */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-600 capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${
                      isActive(item.path) ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Logout */}
          <div className="p-6 border-t">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="p-8">
          {title && (
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              {title}
            </h1>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default RoleLayout;