const Waste = require('../models/Waste');
const User = require('../models/User');
const ContestEntry = require('../models/Contest');

// Get all waste submissions for admin review
const getAllWasteSubmissions = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const wastes = await Waste.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Waste.countDocuments(query);
    
    res.json({
      wastes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve/reject waste submission
const reviewWasteSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const waste = await Waste.findById(id).populate('user');
    
    if (!waste) {
      return res.status(404).json({ message: 'Waste submission not found' });
    }
    
    // If changing from approved to rejected or vice versa, adjust user's eco coins
    if (waste.status === 'approved' && status === 'rejected') {
      await User.findByIdAndUpdate(waste.user._id, {
        $inc: { ecoCoins: -waste.coins }
      });
    } else if (waste.status !== 'approved' && status === 'approved') {
      await User.findByIdAndUpdate(waste.user._id, {
        $inc: { ecoCoins: waste.coins }
      });
    }
    
    waste.status = status;
    waste.approvedBy = req.user._id;
    await waste.save();
    
    res.json(waste);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all users for admin
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get admin dashboard stats
const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalWasteSubmissions = await Waste.countDocuments();
    const pendingSubmissions = await Waste.countDocuments({ status: 'pending' });
    const totalContestEntries = await ContestEntry.countDocuments();
    
    // Weekly stats
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyUsers = await User.countDocuments({ createdAt: { $gte: oneWeekAgo } });
    const weeklySubmissions = await Waste.countDocuments({ createdAt: { $gte: oneWeekAgo } });
    
    // Get recent activities
    const recentUsers = await User.find()
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    
    const recentSubmissions = await Waste.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      totalWasteSubmissions,
      pendingSubmissions,
      totalContestEntries,
      weeklyUsers,
      weeklySubmissions,
      recentUsers,
      recentSubmissions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get system statistics
const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalWaste = await Waste.countDocuments();
    const totalContests = await ContestEntry.countDocuments();
    
    // User growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    
    // Waste submission stats
    const approvedWaste = await Waste.countDocuments({ status: 'approved' });
    const rejectedWaste = await Waste.countDocuments({ status: 'rejected' });
    const pendingWaste = await Waste.countDocuments({ status: 'pending' });
    
    // Top users by eco coins
    const topUsers = await User.find()
      .select('name email ecoCoins totalWasteUploaded')
      .sort({ ecoCoins: -1 })
      .limit(5);

    res.json({
      totalUsers,
      totalWaste,
      totalContests,
      newUsers,
      wasteStats: {
        approved: approvedWaste,
        rejected: rejectedWaste,
        pending: pendingWaste
      },
      topUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all contest entries for admin
const getAllContestEntries = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const contestEntries = await ContestEntry.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await ContestEntry.countDocuments(query);
    
    res.json({
      contestEntries,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update contest entry
const updateContestEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, winner } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (winner !== undefined) updateData.winner = winner;
    
    const contestEntry = await ContestEntry.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'name email');
    
    if (!contestEntry) {
      return res.status(404).json({ message: 'Contest entry not found' });
    }
    
    res.json(contestEntry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllWasteSubmissions,
  reviewWasteSubmission,
  getAllUsers,
  deleteUser,
  updateUserRole,
  getAdminDashboard,
  getSystemStats,
  getAllContestEntries,
  updateContestEntry
};