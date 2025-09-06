const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register user - MANUALLY hash the password
const registerUser = async (req, res) => {
  try {
    console.log('Registration attempt for:', req.body.email);
    const { name, email, password } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('Registration failed: User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // MANUALLY hash the password before creating user
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const user = await User.create({
      name,
      email,
      password: hashedPassword  // Use the hashed password
    });
    
    if (user) {
      console.log('Registration successful for:', user.email);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        ecoCoins: user.ecoCoins,
        role: user.role,
        token: generateToken(user._id),
        redirectTo: user.role === 'admin' ? '/admin/dashboard' : '/dashboard'
      });
    }
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user - SIMPLIFIED
const loginUser = async (req, res) => {
  try {
    console.log('Login attempt for:', req.body.email);
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    console.log('User found:', user.email);
    console.log('User role:', user.role);
    
    // Use direct bcrypt comparison ONLY
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);
    
    if (isMatch) {
      console.log('Login successful:', user.email);
      
      // Determine redirect path based on user role
      const redirectTo = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        ecoCoins: user.ecoCoins,
        role: user.role,
        token: generateToken(user._id),
        redirectTo: redirectTo // Add redirect path to response
      });
    } else {
      console.log('Invalid password');
      res.status(401).json({ message: 'Invalid email or password' });
    }
    
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Logout user
const logoutUser = async (req, res) => {
  try {
    console.log('Logout request from user:', req.user._id);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    console.log('Profile request from user:', req.user._id);
    const user = await User.findById(req.user._id);
    
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ecoCoins: user.ecoCoins,
        totalWasteUploaded: user.totalWasteUploaded,
        contestSubmissions: user.contestSubmissions,
        rank: user.rank,
        joinDate: user.joinDate,
        weeklyGoal: user.weeklyGoal,
        weeklyProgress: user.weeklyProgress,
        redirectTo: user.role === 'admin' ? '/admin-dashboard' : '/dashboard'
      });
    }
  } catch (error) {
    console.error('Profile error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create admin user (protected route)
const createAdminUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create admin user with hashed password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const adminUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      ecoCoins: 1000,
      rank: 'Eco Master',
      weeklyGoal: 50
    });
    
    res.status(201).json({
      _id: adminUser._id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
      redirectTo: '/admin/dashboard',
      message: 'Admin user created successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser,
  createAdminUser
};