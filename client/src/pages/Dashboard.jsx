import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Trophy, Upload, Coins, TrendingUp, Award, Calendar, Target, Loader, Shield, Users, FileCheck, BarChart3, Image as ImageIcon } from 'lucide-react';
import Navbar from '../components/Navbar';
import { userAPI, adminAPI } from '../services/api';

// Safe Image Component for Dashboard
const SafeImage = ({ src, alt, className, ...props }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getProcessedUrl = () => {
    if (!src) return null;
    
    // If it's already a full URL, return it
    if (src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:')) {
      return src;
    }
    
    // If it's a relative path from server, construct proper URL
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
    
    // Handle avatar paths
    if (src.includes('avatars')) {
      return `${baseUrl}${src}`;
    }
    
    // Handle other upload paths
    if (src.startsWith('/uploads/')) {
      return `${baseUrl}${src}`;
    } else if (src.startsWith('uploads/')) {
      return `${baseUrl}/${src}`;
    }
    
    // For any other relative paths
    return `${baseUrl}/uploads/${src}`;
  };

  const processedUrl = getProcessedUrl();

  const handleError = () => {
    console.error('Image failed to load:', processedUrl);
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  if (!processedUrl || hasError) {
    return (
      <div className={`${className} bg-gray-700 flex items-center justify-center rounded-lg border border-gray-600`}>
        <div className="text-center">
          <ImageIcon className="w-6 h-6 text-gray-500 mx-auto mb-1" />
          <span className="text-gray-400 text-xs">No image</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-700 animate-pulse flex items-center justify-center rounded-lg">
          <Loader className="w-4 h-4 text-gray-500 animate-spin" />
        </div>
      )}
      <img
        src={processedUrl}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} object-cover rounded-lg`}
        crossOrigin="anonymous"
        decoding="async"
        loading="lazy"
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </div>
  );
};

const Dashboard = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    ecoCoins: 0,
    totalWasteUploaded: 0,
    contestSubmissions: 0,
    joinDate: '',
    rank: 'Eco Beginner',
    weeklyGoal: 10,
    weeklyProgress: 0,
    role: 'user',
    avatar: ''
  });
  const [recentUploads, setRecentUploads] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminStats, setAdminStats] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardData();
  }, []);

  const getDashboardData = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getDashboard();
      const { user: userData, recentUploads: uploads, weeklyProgress, achievements: userAchievements } = response.data;
      
      setUser({
        ...userData,
        weeklyProgress: weeklyProgress || 0
      });
      
      // Process uploads - keep original image paths, SafeImage will handle URLs
      setRecentUploads(uploads || []);
      setIsAdmin(userData?.role === 'admin');
      
      if (userData?.role === 'admin') {
        await fetchAdminStats();
      }
      
      if (userAchievements && userAchievements.length > 0) {
        setAchievements(userAchievements);
      } else {
        const defaultAchievements = [
          { name: 'First Upload', icon: '🎯', unlocked: userData.totalWasteUploaded > 0 },
          { name: 'Eco Warrior', icon: '🌱', unlocked: userData.ecoCoins >= 1000 },
          { name: 'Contest Champion', icon: '🏆', unlocked: userData.contestSubmissions > 0 },
          { name: 'Green Champion', icon: '🌿', unlocked: userData.totalWasteUploaded >= 50 }
        ];
        setAchievements(defaultAchievements);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const response = await adminAPI.getAdminDashboard();
      setAdminStats(response.data);
    } catch (error) {
      console.error('Failed to load admin stats:', error);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await userAPI.uploadAvatar(formData);
      setUser(prev => ({ ...prev, avatar: response.data.avatar }));
      alert('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload profile picture');
    }
  };

  // Calculate weekly progress percentage
  const progressPercentage = user.weeklyGoal > 0 
    ? Math.min(100, (user.weeklyProgress / user.weeklyGoal) * 100) 
    : 0;

  const stats = [
    {
      title: 'Total Eco Coins',
      value: user.ecoCoins,
      icon: <Coins className="w-8 h-8" />,
      color: 'from-yellow-500 to-amber-500',
      change: user.weeklyProgress > 0 ? `+${user.weeklyProgress * 25} this week` : 'No activity this week'
    },
    {
      title: 'Waste Uploaded',
      value: user.totalWasteUploaded,
      icon: <Upload className="w-8 h-8" />,
      color: 'from-green-500 to-emerald-500',
      change: user.weeklyProgress > 0 ? `+${user.weeklyProgress} this week` : 'No uploads this week'
    },
    {
      title: 'Contest Entries',
      value: user.contestSubmissions,
      icon: <Trophy className="w-8 h-8" />,
      color: 'from-purple-500 to-violet-500',
      change: user.contestSubmissions > 0 ? `${user.contestSubmissions} total entries` : 'No entries yet'
    },
    {
      title: 'Current Rank',
      value: user.rank,
      icon: <Award className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-500',
      change: user.ecoCoins >= 500 ? 'Level up available!' : `${500 - user.ecoCoins} coins to next rank`
    }
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white">
      <Navbar />
      
      <div className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">
                  Welcome back, {user.name}!
                </h1>
                <p className="text-gray-400">Track your eco impact and manage your waste contributions</p>
              </div>
              {isAdmin && (
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Administrator</span>
                </div>
              )}
            </div>
          </div>

          {/* ADMIN PANEL */}
          {isAdmin && adminStats && (
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-cyan-500/30 mb-8">
              <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-2" />
                Admin Control Panel
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <Users className="w-8 h-8 text-cyan-400" />
                    <span className="text-2xl font-bold text-cyan-400">{adminStats.totalUsers || 0}</span>
                  </div>
                  <p className="text-cyan-300 text-sm mt-2">Total Users</p>
                </div>
                
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <FileCheck className="w-8 h-8 text-yellow-400" />
                    <span className="text-2xl font-bold text-yellow-400">{adminStats.pendingSubmissions || 0}</span>
                  </div>
                  <p className="text-yellow-300 text-sm mt-2">Pending Reviews</p>
                </div>
                
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <BarChart3 className="w-8 h-8 text-green-400" />
                    <span className="text-2xl font-bold text-green-400">{adminStats.totalWasteSubmissions || 0}</span>
                  </div>
                  <p className="text-green-300 text-sm mt-2">Total Submissions</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link 
                  to="/admin/users"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Manage Users
                </Link>
                
                <Link 
                  to="/admin/waste"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center"
                >
                  <FileCheck className="w-5 h-5 mr-2" />
                  Review Waste
                </Link>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700 hover:border-cyan-500/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                    {stat.icon}
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-xs text-green-400">{stat.change}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Weekly Progress */}
              <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <Target className="w-6 h-6 mr-2 text-cyan-400" />
                    Weekly Goal Progress
                  </h2>
                  <span className="text-sm text-gray-400">{user.weeklyProgress}/{user.weeklyGoal} uploads</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-gray-400 text-sm">
                  {user.weeklyGoal - user.weeklyProgress > 0 
                    ? `${user.weeklyGoal - user.weeklyProgress} more uploads to reach your weekly goal!`
                    : 'Weekly goal completed! Great job!'}
                </p>
              </div>

              {/* Recent Uploads */}
              <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <Upload className="w-6 h-6 mr-2 text-green-400" />
                    Recent Uploads
                  </h2>
                  <Link to="/waste-upload" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                    Upload New →
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {recentUploads.length > 0 ? (
                    recentUploads.map((upload) => (
                      <div key={upload._id} className="flex items-center space-x-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200">
                        <SafeImage 
                          src={upload.image}
                          alt={upload.type}
                          className="w-16 h-16 rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-white capitalize">{upload.type}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              upload.status === 'approved' 
                                ? 'bg-green-500/20 text-green-400' 
                                : upload.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {upload.status}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm">{upload.location} • {new Date(upload.createdAt).toLocaleDateString()}</p>
                          <div className="flex items-center mt-1">
                            <Coins className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-yellow-400 text-sm font-medium">
                              {upload.status === 'approved' ? `+${upload.coins} coins` : 'Pending approval'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No waste uploads yet</p>
                      <Link to="/waste-upload" className="text-cyan-400 hover:text-cyan-300 text-sm">
                        Upload your first waste report
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Profile Card */}
              <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
                <div className="text-center mb-6">
                  <div className="relative w-20 h-20 mx-auto mb-4 group">
                    {user.avatar ? (
                      <SafeImage 
                        src={user.avatar}
                        alt={user.name}
                        className="w-20 h-20 rounded-full object-cover shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <User className="w-10 h-10 text-white" />
                      </div>
                    )}
                    <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Upload className="w-5 h-5 text-white" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <h3 className="text-xl font-semibold text-white">{user.name}</h3>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                  <div className="mt-3 px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30">
                    <span className="text-purple-300 text-sm font-medium capitalize">{user.rank}</span>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Member since</span>
                    <span className="text-white">{new Date(user.joinDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Eco Coins</span>
                    <span className="text-yellow-400 font-medium">{user.ecoCoins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Waste Uploads</span>
                    <span className="text-green-400 font-medium">{user.totalWasteUploaded}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link 
                    to="/waste-upload"
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white p-3 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Waste
                  </Link>
                  <Link 
                    to="/social-feed"
                    className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white p-3 rounded-xl font-medium hover:from-purple-700 hover:to-violet-700 transition-all duration-200 flex items-center justify-center"
                  >
                    <Trophy className="w-5 h-5 mr-2" />
                    Join Contest
                  </Link>
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-400" />
                  Achievements
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {achievements.map((achievement, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                        achievement.unlocked 
                          ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' 
                          : 'bg-gray-700/30 border-gray-600 text-gray-500'
                      }`}
                    >
                      <div className="text-2xl mb-1">{achievement.icon}</div>
                      <p className="text-xs font-medium">{achievement.name}</p>
                      <p className="text-[10px] mt-1">
                        {achievement.unlocked ? 'Unlocked' : 'Locked'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;