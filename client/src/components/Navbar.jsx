import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { authAPI } from '../services/api';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setCurrentUser(user);
    }
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      // Call the logout API endpoint
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the API call fails, we still want to clear local storage
    } finally {
      // Always clear client-side storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      setIsMenuOpen(false);
      navigate('/');
    }
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Waste', path: '/waste-upload' },
    { name: 'Learning', path: '/learning' },
    { name: 'Contest', path: '/social-feed' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-gray-900/95 backdrop-blur-md shadow-xl py-2' 
        : 'bg-transparent py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo and Brand Name */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">⚡</span>
              </div>
              <span className="text-white font-bold text-2xl tracking-tight">
                <span className="font-light">HALF</span>
                <span className="font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">ENGINEER</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    location.pathname === item.path
                      ? 'text-white bg-cyan-400/10'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <>
                {/* User Profile */}
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 bg-gray-800/50 px-4 py-3 rounded-full border border-gray-700 hover:border-cyan-400/50 transition-all duration-300"
                >
                  <User className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-gray-200">{currentUser.name}</span>
                </Link>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="bg-transparent text-red-400 border border-red-400/50 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:bg-red-400/10 hover:border-red-400 hover:shadow-lg hover:shadow-red-400/20 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                {/* Login/Signup Buttons */}
                <Link
                  to="/login"
                  className="bg-transparent text-cyan-400 border border-cyan-400/50 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:bg-cyan-400/10 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/20"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:from-blue-600 hover:to-cyan-600 hover:shadow-lg hover:shadow-cyan-500/30 transform hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800/50 rounded-lg backdrop-blur-lg">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'text-white bg-cyan-400/10'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-gray-700">
                {currentUser ? (
                  <>
                    {/* User Profile in Mobile */}
                    <div className="flex items-center space-x-3 px-3 py-2 mb-3 bg-gray-900/50 rounded-lg">
                      <User className="w-5 h-5 text-cyan-400" />
                      <div className="flex-1">
                        <p className="text-sm text-white">{currentUser.name}</p>
                        <p className="text-xs text-gray-400">{currentUser.email}</p>
                      </div>
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {currentUser.ecoCoins || 0}
                      </div>
                    </div>
                    
                    {/* Logout Button in Mobile */}
                    <button
                      onClick={handleLogout}
                      className="w-full bg-transparent text-red-400 border border-red-400/50 px-4 py-2 rounded-full text-sm font-medium mb-2 transition-all duration-300 hover:bg-red-400/10 hover:border-red-400 flex items-center justify-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Login/Signup Buttons in Mobile */}
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full bg-transparent text-cyan-400 border border-cyan-400/50 px-4 py-2 rounded-full text-sm font-medium mb-2 transition-all duration-300 hover:bg-cyan-400/10 block text-center"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:from-blue-600 hover:to-cyan-600 block text-center"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;