import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { 
    adminLogin, 
    loading, 
    error, 
    isAuthenticated, 
    isAdmin,
    clearError 
  } = useAdmin();
  
  const navigate = useNavigate();

  // Clear any existing errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]); // Now safe to include clearError since it's memoized

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Load remembered credentials
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('adminRememberEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any existing errors
    clearError();
    
    // Basic validation
    if (!email || !password) {
      return;
    }

    try {
      // Call admin login from context
      await adminLogin({ email, password });
      
      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem('adminRememberEmail', email);
      } else {
        localStorage.removeItem('adminRememberEmail');
      }
      
      // Navigation will be handled by useEffect when isAuthenticated becomes true
    } catch (error) {
      // Error is already handled in the AdminContext
      console.error('Login failed:', error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="">
                {/* <ShoppingBag className="h-8 w-8 text-blue-600" /> */}
                <img
                    src='/images/favicon.svg'
                    alt='logo'
                    className='h-16 w-auto'
                />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">CessPlug Admin</h2>
            <p className="text-gray-600">Sign in to your admin dashboard</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="admin@cessplug.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            {/* <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                  disabled={loading}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember email
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  disabled={loading}
                  onClick={() => {
                    // You can implement forgot password functionality here
                    alert('Please contact system administrator for password reset');
                  }}
                >
                  Forgot password?
                </button>
              </div>
            </div> */}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          {/* <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center mb-2">
              Demo credentials for testing:
            </p>
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@cessplug.com');
                  setPassword('admin123');
                }}
                className="text-xs text-blue-600 hover:text-blue-500 font-medium transition-colors"
                disabled={loading}
              >
                admin@cessplug.com / admin123
              </button>
            </div>
          </div> */}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            CessPlug Admin Panel - Secure Access Only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;