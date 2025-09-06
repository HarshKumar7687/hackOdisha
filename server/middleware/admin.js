const User = require('../models/User');

const requireAdmin = async (req, res, next) => {
  try {
    console.log('Checking admin access for user:', req.user._id);
    
    // Get fresh user data from database to check role
    const user = await User.findById(req.user._id);
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User role:', user.role);
    
    if (user.role === 'admin') {
      console.log('Admin access granted');
      next(); // User is admin, proceed to the route
    } else {
      console.log('Admin access denied - user is not admin');
      res.status(403).json({ message: 'Admin access required' });
    }
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { requireAdmin };