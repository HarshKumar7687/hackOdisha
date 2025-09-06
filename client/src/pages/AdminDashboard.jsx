import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Users, FileCheck, BarChart3, Shield, TrendingUp, AlertCircle, 
  CheckCircle, XCircle, Home, Settings, Award, RefreshCw 
} from 'lucide-react';
import { adminAPI } from '../services/api';
import UserManagement from '../components/UserManagement';
import WasteReview from '../components/WasteReview';
import ContestManagement from '../components/ContestManagement';
import SystemStats from '../components/SystemStats';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Fetch data on initial load and when refresh is manually triggered
  useEffect(() => {
    fetchAdminData();
  }, []); // Empty dependency array means this runs once on mount

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAdminDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500',
      change: `${stats.weeklyUsers || 0} new this week`,
      link: '/admin/users'
    },
    {
      title: 'Total Submissions',
      value: stats.totalWasteSubmissions || 0,
      icon: <FileCheck className="w-6 h-6" />,
      color: 'bg-green-500',
      change: `${stats.weeklySubmissions || 0} this week`,
      link: '/admin/waste'
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingSubmissions || 0,
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'bg-yellow-500',
      change: 'Needs attention',
      link: '/admin/waste?status=pending'
    },
    {
      title: 'Contest Entries',
      value: stats.totalContestEntries || 0,
      icon: <Award className="w-6 h-6" />,
      color: 'bg-purple-500',
      change: 'Total entries',
      link: '/admin/contests'
    }
  ];

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Waste Review', href: '/admin/waste', icon: FileCheck },
    { name: 'Contests', href: '/admin/contests', icon: Award },
    { name: 'Statistics', href: '/admin/stats', icon: BarChart3 },
  ];

  // Show loading spinner only on the dashboard home
  if (loading && location.pathname === '/admin') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-cyan-400" />
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-cyan-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-cyan-400" />
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-cyan-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
            </h2>
            <button
              onClick={fetchAdminData}
              className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<DashboardHome statCards={statCards} stats={stats} />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/waste" element={<WasteReview />} />
            <Route path="/contests" element={<ContestManagement />} />
            <Route path="/stats" element={<SystemStats />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

// Dashboard Home Component
const DashboardHome = ({ statCards, stats }) => {
  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-cyan-500 transition-colors block"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-20`}>
                {stat.icon}
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-xs text-green-400">{stat.change}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-400" />
            Recent Users
          </h2>
          <div className="space-y-3">
            {stats.recentUsers && stats.recentUsers.length > 0 ? (
              stats.recentUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No recent users</p>
            )}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FileCheck className="w-5 h-5 mr-2 text-green-400" />
            Recent Submissions
          </h2>
          <div className="space-y-3">
            {stats.recentSubmissions && stats.recentSubmissions.length > 0 ? (
              stats.recentSubmissions.map((submission) => (
                <div key={submission._id} className="p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-white">{submission.user?.name}</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      submission.status === 'approved' 
                        ? 'bg-green-500/20 text-green-400' 
                        : submission.status === 'rejected'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {submission.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{submission.type} • {submission.location}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(submission.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No recent submissions</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin/users" className="bg-blue-600 hover:bg-blue-700 p-4 rounded-lg text-center transition-colors block">
            <Users className="w-8 h-8 mx-auto mb-2" />
            <span>Manage Users</span>
          </Link>
          <Link to="/admin/waste?status=pending" className="bg-green-600 hover:bg-green-700 p-4 rounded-lg text-center transition-colors block">
            <FileCheck className="w-8 h-8 mx-auto mb-2" />
            <span>Review Waste</span>
          </Link>
          <Link to="/admin/stats" className="bg-purple-600 hover:bg-purple-700 p-4 rounded-lg text-center transition-colors block">
            <BarChart3 className="w-8 h-8 mx-auto mb-2" />
            <span>View Reports</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;