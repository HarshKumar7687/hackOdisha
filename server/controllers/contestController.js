const ContestEntry = require('../models/Contest');
const Vote = require('../models/Vote');

// Get all contest entries
const getContestEntries = async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    
    const query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const contestEntries = await ContestEntry.find(query)
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Process images to include full URLs
    const processedEntries = contestEntries.map(entry => {
      const entryObj = entry.toObject();
      
      // Process user avatar
      if (entryObj.user?.avatar && !entryObj.user.avatar.startsWith('http')) {
        const baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
        entryObj.user.avatar = `${baseUrl}${entryObj.user.avatar.startsWith('/') ? '' : '/'}${entryObj.user.avatar}`;
      }
      
      // Process entry images
      if (entryObj.images && entryObj.images.length > 0) {
        entryObj.images = entryObj.images.map(img => {
          if (img && !img.startsWith('http')) {
            const baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
            return `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`;
          }
          return img;
        });
      }
      
      return entryObj;
    });
    
    const total = await ContestEntry.countDocuments(query);
    
    res.json({
      contestEntries: processedEntries,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create contest entry
const createContestEntry = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    // Use relative paths for images (frontend will handle full URL)
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    const contestEntry = await ContestEntry.create({
      user: req.user._id,
      title,
      description,
      images,
      category,
      votes: 0
    });
    
    await contestEntry.populate('user', 'name email avatar');
    
    res.status(201).json(contestEntry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Vote for contest entry
const voteForEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    const { voteType } = req.body;
    
    // Check if user already voted
    const existingVote = await Vote.findOne({
      user: req.user._id,
      contestEntry: entryId
    });
    
    if (existingVote) {
      // Update existing vote
      if (existingVote.voteType !== voteType) {
        existingVote.voteType = voteType;
        await existingVote.save();
        
        // Update vote count
        const entry = await ContestEntry.findById(entryId);
        if (voteType === 'up') {
          entry.votes += 2; // +1 for new upvote, -1 for previous downvote
        } else {
          entry.votes -= 2; // -1 for new downvote, +1 for previous upvote
        }
        await entry.save();
      }
    } else {
      // Create new vote
      await Vote.create({
        user: req.user._id,
        contestEntry: entryId,
        voteType
      });
      
      // Update vote count
      const entry = await ContestEntry.findById(entryId);
      entry.votes += (voteType === 'up' ? 1 : -1);
      await entry.save();
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await ContestEntry.aggregate([
      {
        $group: {
          _id: '$user',
          totalVotes: { $sum: '$votes' },
          entriesCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          'user.password': 0,
          'user.__v': 0
        }
      },
      {
        $sort: { totalVotes: -1 }
      }
    ]);
    
    // Process user avatars in leaderboard
    const processedLeaderboard = leaderboard.map(item => {
      if (item.user?.avatar && !item.user.avatar.startsWith('http')) {
        const baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
        item.user.avatar = `${baseUrl}${item.user.avatar.startsWith('/') ? '' : '/'}${item.user.avatar}`;
      }
      return item;
    });
    
    res.json(processedLeaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getContestEntries,
  createContestEntry,
  voteForEntry,
  getLeaderboard
};