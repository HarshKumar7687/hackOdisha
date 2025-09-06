import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Trophy, Upload, Calendar, Award, Users, TrendingUp, Loader, 
  ChevronUp, ChevronDown 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { 
  fetchContestEntries, 
  fetchLeaderboard, 
  voteForEntry,
  setUserVote
} from '../store/contestSlice';
import { contestAPI } from '../services/api';

// Helper function to get current contest period (Sunday to Saturday)
const getCurrentContestPeriod = () => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - currentDay); // Set to Sunday of this week
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6); // Set to Saturday of this week
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
};

// Calculate days left in the contest
const getDaysLeft = () => {
  const { endDate } = getCurrentContestPeriod();
  const now = new Date();
  const timeDiff = endDate - now;
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return daysLeft > 0 ? daysLeft : 0;
};

// Format date for display
const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

// Safe Image Component to prevent WebGL issues and empty src
const SafeImage = ({ src, alt, className, ...props }) => {
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (src) {
      // If it's a relative path, prepend the backend URL
      let imageUrl = src;
      if (src && !src.startsWith('http') && !src.startsWith('blob:') && !src.startsWith('data:')) {
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
        imageUrl = `${baseUrl}${src.startsWith('/') ? '' : '/'}${src}`;
      }
      setImageSrc(imageUrl);
      setHasError(false);
    } else {
      // If no src, set to null to prevent empty string
      setImageSrc(null);
    }
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc('https://via.placeholder.com/400x200?text=Image+Not+Found');
    }
  };

  // Don't render the image if there's no valid source
  if (!imageSrc) {
    return (
      <div className={`${className} bg-gray-700 flex items-center justify-center`}>
        <span className="text-gray-400 text-sm">No image</span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      crossOrigin="anonymous"
      decoding="async"
      loading="lazy"
      onError={handleError}
      {...props}
    />
  );
};

const SocialFeed = () => {
  const dispatch = useDispatch();
  const { 
    entries, 
    leaderboard, 
    userVotes, 
    loading, 
    error 
  } = useSelector(state => state.contest);
  
  const [activeTab, setActiveTab] = useState('contest');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [contestPeriod, setContestPeriod] = useState(getCurrentContestPeriod());
  const [daysLeft, setDaysLeft] = useState(getDaysLeft());

  // Update contest info daily
  useEffect(() => {
    // Set up interval to check for day changes
    const interval = setInterval(() => {
      const newDaysLeft = getDaysLeft();
      if (newDaysLeft !== daysLeft) {
        setDaysLeft(newDaysLeft);
        setContestPeriod(getCurrentContestPeriod());
        
        // If it's a new week, refresh data
        if (newDaysLeft === 7) {
          dispatch(fetchContestEntries());
          dispatch(fetchLeaderboard());
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [daysLeft, dispatch]);

  useEffect(() => {
    dispatch(fetchContestEntries());
    dispatch(fetchLeaderboard());
    
    // Initialize contest period and days left
    setContestPeriod(getCurrentContestPeriod());
    setDaysLeft(getDaysLeft());
  }, [dispatch]);

  const handleVote = async (entryId, voteType) => {
    try {
      const currentVote = userVotes[entryId];
      let newVote = null;
      
      if (currentVote === voteType) {
        newVote = null;
      } else {
        newVote = voteType;
      }

      // Update UI optimistically
      dispatch(setUserVote(entryId, newVote));

      // Send vote to backend
      await dispatch(voteForEntry(entryId, voteType));
      
      // Refresh data
      dispatch(fetchContestEntries());
      dispatch(fetchLeaderboard());
    } catch (error) {
      console.error('Error voting:', error);
      // Revert on error
      dispatch(fetchContestEntries());
    }
  };

  const handleSubmitEntry = async (formData) => {
    try {
      await contestAPI.createContestEntry(formData);
      setShowUploadModal(false);
      dispatch(fetchContestEntries()); // Refresh contest entries
    } catch (error) {
      console.error('Error submitting entry:', error);
    }
  };

  const contestStats = {
    totalEntries: entries.length,
    totalVotes: entries.reduce((sum, entry) => sum + (entry.votes || 0), 0),
    daysLeft: daysLeft,
    prize: '500 Eco Coins'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white">
        <Navbar />
        <div className="pt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8">
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => {
                  dispatch(fetchContestEntries());
                  dispatch(fetchLeaderboard());
                }}
                className="mt-4 bg-cyan-600 text-white px-6 py-2 rounded-xl hover:bg-cyan-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white">
      <Navbar />
      
      <div className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
              Weekly Contest
            </h1>
            <p className="text-gray-400 text-lg mb-6">
              Show off your waste-to-wonder creations and compete for eco coins!
            </p>
            
            {/* Contest Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-4 border border-gray-700">
                <div className="text-2xl font-bold text-purple-400">{contestStats.totalEntries}</div>
                <div className="text-xs text-gray-400">Entries</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-4 border border-gray-700">
                <div className="text-2xl font-bold text-pink-400">{contestStats.totalVotes}</div>
                <div className="text-xs text-gray-400">Total Votes</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-4 border border-gray-700">
                <div className="text-2xl font-bold text-cyan-400">{contestStats.daysLeft}</div>
                <div className="text-xs text-gray-400">Days Left</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-4 border border-gray-700">
                <div className="text-2xl font-bold text-yellow-400">{contestStats.prize}</div>
                <div className="text-xs text-gray-400">Prize</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-2 border border-gray-700">
              <button
                onClick={() => setActiveTab('contest')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'contest'
                    ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Contest Entries
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'leaderboard'
                    ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Leaderboard
              </button>
            </div>
          </div>

          {activeTab === 'contest' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contest Entries */}
              <div className="lg:col-span-2">
                {/* Upload Button */}
                <div className="mb-8">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center border-2 border-dashed border-green-500/30 hover:border-green-500/50"
                  >
                    <Upload className="w-6 h-6 mr-2" />
                    Submit Your Creation
                  </button>
                </div>

                {/* Entries Grid */}
                <div className="space-y-6">
                  {entries.length > 0 ? (
                    entries.map((entry) => {
                      const entryId = entry._id || entry.id;
                      const imageUrl = entry.images && entry.images.length > 0 ? entry.images[0] : null;
                      const userAvatar = entry.user?.avatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100';
                      const userName = entry.user?.name || entry.username || 'Unknown User';
                      
                      return (
                      <div key={entryId} className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700 overflow-hidden hover:border-purple-500/50 transition-all duration-300">
                        {/* Entry Header */}
                        <div className="p-6 pb-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <SafeImage 
                                src={userAvatar}
                                alt={userName}
                                className="w-12 h-12 rounded-full object-cover mr-4"
                              />
                              <div>
                                <h3 className="font-semibold text-white">{userName}</h3>
                                <p className="text-gray-400 text-sm">{new Date(entry.createdAt || entry.date).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                              {entry.category}
                            </span>
                          </div>
                          
                          <h2 className="text-xl font-semibold text-white mb-2">{entry.title}</h2>
                          <p className="text-gray-300 mb-4">{entry.description}</p>
                        </div>

                        {/* Entry Image - Only show if image exists */}
                        {imageUrl && (
                          <div className="px-6">
                            <SafeImage 
                              src={imageUrl} 
                              alt={entry.title}
                              className="w-full h-64 object-cover rounded-xl"
                            />
                          </div>
                        )}

                        {/* Entry Actions - Only Upvote/Downvote */}
                        <div className="p-6 pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <button
                                onClick={() => handleVote(entryId, 'up')}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                                  userVotes[entryId] === 'up'
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : 'bg-gray-700/50 text-gray-400 hover:text-green-400 hover:bg-green-500/10'
                                }`}
                              >
                                <ChevronUp className="w-5 h-5" />
                                <span>{entry.votes || 0}</span>
                              </button>
                              
                              <button
                                onClick={() => handleVote(entryId, 'down')}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                                  userVotes[entryId] === 'down'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-gray-700/50 text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                                }`}
                              >
                                <ChevronDown className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )})
                  ) : (
                    <div className="text-center py-12">
                      <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No contest entries yet</p>
                      <p className="text-gray-500 text-sm mt-2">Be the first to submit your creation!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Current Contest Info */}
                <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                    This Week's Contest
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30">
                      <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-white font-semibold">Best Out of Waste</p>
                      <p className="text-gray-300 text-sm">
                        {formatDate(contestPeriod.startDate)} - {formatDate(contestPeriod.endDate)}
                      </p>
                    </div>
                    
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-600">
                      <h4 className="font-medium text-white mb-2">Prize Pool</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">🥇 1st Place</span>
                          <span className="text-yellow-400">500 Coins</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">🥈 2nd Place</span>
                          <span className="text-gray-300">300 Coins</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">🥉 3rd Place</span>
                          <span className="text-orange-400">200 Coins</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contest Rules */}
                <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">📋 Contest Rules</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      Create something useful from waste
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      Upload clear before/after photos
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      Include detailed description
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      One entry per user per week
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      Voting ends Sunday midnight
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-2xl font-semibold text-white flex items-center">
                    <Award className="w-6 h-6 mr-2 text-yellow-400" />
                    Weekly Leaderboard - Top Upvoted Users
                  </h2>
                  <p className="text-gray-400 mt-2">Users with the highest total upvotes</p>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {leaderboard.length > 0 ? (
                      leaderboard.map((user, index) => {
                        const userId = user._id || user.id;
                        const userName = user.user?.name || user.name || user.username || 'Unknown User';
                        const userAvatar = user.user?.avatar || user.avatar || 'https://images.pexels.com/photos-774909.jpeg?auto=compress&cs=tinysrgb&w=100';
                        const totalVotes = user.totalVotes || user.votes || 0;
                        
                        return (
                          <div 
                            key={userId || index} 
                            className={`flex items-center p-4 rounded-xl transition-all duration-200 ${
                              index < 3 
                                ? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30' 
                                : 'bg-gray-900/50 border border-gray-600'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 font-bold ${
                              index === 0 ? 'bg-yellow-500 text-black' :
                              index === 1 ? 'bg-gray-300 text-black' :
                              index === 2 ? 'bg-orange-500 text-white' :
                              'bg-gray-600 text-white'
                            }`}>
                              {index + 1}
                            </div>
                            
                            <SafeImage 
                              src={userAvatar} 
                              alt={userName}
                              className="w-12 h-12 rounded-full object-cover mr-4"
                            />
                            
                            <div className="flex-1">
                              <h3 className="font-semibold text-white">{userName}</h3>
                              <div className="flex items-center text-sm text-gray-400">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                {totalVotes} upvotes
                              </div>
                            </div>
                            
                            {index < 3 && (
                              <div className="text-right">
                                <div className="text-yellow-400 font-semibold text-xl">
                                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {index === 0 ? '1st' : index === 1 ? '2nd' : '3rd'} Place
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No leaderboard data yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal 
          onClose={() => setShowUploadModal(false)} 
          onSubmit={handleSubmitEntry}
        />
      )}
    </div>
  );
};

// Upload Modal Component
const UploadModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    images: []
  });
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      
      // Append each image file
      formData.images.forEach(image => {
        submitData.append('images', image);
      });
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = (e) => {
    setFormData({
      ...formData,
      images: Array.from(e.target.files)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700">
        <h3 className="text-2xl font-semibold text-white mb-6">Submit Contest Entry</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Give your creation a catchy title"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
              required
            >
              <option value="">Select a category</option>
              <option value="Upcycling">Upcycling</option>
              <option value="Art">Art</option>
              <option value="Composting">Composting</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe how you transformed waste into something amazing"
              rows={4}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none resize-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Upload Images</label>
            <input
              type="file"
              multiple
              onChange={handleImageChange}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
              required
            />
            <p className="text-gray-400 text-sm mt-2">Upload before/after photos (multiple allowed)</p>
          </div>
          
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all duration-200"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-200 flex items-center justify-center"
              disabled={uploading}
            >
              {uploading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                'Submit Entry'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SocialFeed;