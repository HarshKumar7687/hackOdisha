import React, { useState, useEffect } from 'react';
import { BarChart3, Users, FileCheck, Award, TrendingUp, Calendar, RefreshCw, Activity, Coins, Star, CheckCircle, XCircle, Clock } from 'lucide-react';
import { adminAPI } from '../services/api';

const SystemStats = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSystemStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load system stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <div className="min-h-screen min-w-screen bg-gray-900 text-gray-100 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mb-4"></div>
          <p className="text-gray-400">Loading system statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-screen bg-gray-900 text-gray-100 p-6">
      <div className="bg-gray-800 p-6 rounded-none border border-gray-700 h-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              System Dashboard
            </h2>
            <p className="text-gray-400 mt-1">Comprehensive overview of platform statistics</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-750 rounded-xl p-5 border border-gray-700 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-full">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Total Users</h3>
            <p className="text-2xl font-bold text-white mb-1">{stats.totalUsers || 0}</p>
            <p className="text-xs text-green-400 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
              {stats.newUsers || 0} new in last 30 days
            </p>
          </div>

          <div className="bg-gray-750 rounded-xl p-5 border border-gray-700 hover:border-green-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <FileCheck className="w-6 h-6 text-green-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Waste Submissions</h3>
            <p className="text-2xl font-bold text-white mb-1">{stats.totalWaste || 0}</p>
            <p className="text-xs text-green-400 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
              {stats.wasteStats?.approved || 0} approved, {stats.wasteStats?.pending || 0} pending
            </p>
          </div>

          <div className="bg-gray-750 rounded-xl p-5 border border-gray-700 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-full">
                <Award className="w-6 h-6 text-purple-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Contest Entries</h3>
            <p className="text-2xl font-bold text-white mb-1">{stats.totalContests || 0}</p>
            <p className="text-xs text-green-400 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
              All time entries
            </p>
          </div>

          <div className="bg-gray-750 rounded-xl p-5 border border-gray-700 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-cyan-500/10 rounded-full">
                <Activity className="w-6 h-6 text-cyan-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-gray-400 text-sm mb-1">System Health</h3>
            <p className="text-2xl font-bold text-white mb-1">100%</p>
            <p className="text-xs text-green-400 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
              All systems operational
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Waste Statistics */}
          <div className="bg-gray-750 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Waste Submission Statistics</h2>
              <BarChart3 className="w-5 h-5 text-cyan-400" />
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-green-400">Approved</span>
                  </div>
                  <span className="text-xl font-bold">{stats.wasteStats?.approved || 0}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-green-500 h-2.5 rounded-full" 
                    style={{ width: `${((stats.wasteStats?.approved || 0) / (stats.totalWaste || 1)) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {Math.round(((stats.wasteStats?.approved || 0) / (stats.totalWaste || 1)) * 100)}% of total submissions
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-yellow-400 mr-2" />
                    <span className="text-yellow-400">Pending</span>
                  </div>
                  <span className="text-xl font-bold">{stats.wasteStats?.pending || 0}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-yellow-500 h-2.5 rounded-full" 
                    style={{ width: `${((stats.wasteStats?.pending || 0) / (stats.totalWaste || 1)) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {Math.round(((stats.wasteStats?.pending || 0) / (stats.totalWaste || 1)) * 100)}% of total submissions
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <XCircle className="w-4 h-4 text-red-400 mr-2" />
                    <span className="text-red-400">Rejected</span>
                  </div>
                  <span className="text-xl font-bold">{stats.wasteStats?.rejected || 0}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-red-500 h-2.5 rounded-full" 
                    style={{ width: `${((stats.wasteStats?.rejected || 0) / (stats.totalWaste || 1)) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {Math.round(((stats.wasteStats?.rejected || 0) / (stats.totalWaste || 1)) * 100)}% of total submissions
                </div>
              </div>
            </div>
          </div>

          {/* Top Users */}
          <div className="bg-gray-750 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Top Users by Eco Coins</h2>
              <Coins className="w-5 h-5 text-yellow-400" />
            </div>
            
            <div className="space-y-3">
              {stats.topUsers && stats.topUsers.length > 0 ? (
                stats.topUsers.map((user, index) => (
                  <div key={user._id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        index === 1 ? 'bg-gray-600/20 text-gray-400' :
                        index === 2 ? 'bg-amber-700/20 text-amber-400' :
                        'bg-cyan-600/20 text-cyan-400'
                      }`}>
                        {index < 3 ? <Star className="w-4 h-4 fill-current" /> : index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-cyan-400 flex items-center justify-end">
                        <Coins className="w-4 h-4 mr-1 text-yellow-400" />
                        {user.ecoCoins || 0}
                      </p>
                      <p className="text-xs text-gray-400">{user.totalWasteUploaded || 0} submissions</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No user data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Stats Section */}
        <div className="mt-6 bg-gray-750 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-6">Platform Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Calendar className="w-5 h-5 text-purple-400 mr-2" />
                <h3 className="font-medium">Daily Average</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {Math.round((stats.totalWaste || 0) / 30)} 
                <span className="text-sm text-gray-400 ml-1">submissions/day</span>
              </p>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Award className="w-5 h-5 text-amber-400 mr-2" />
                <h3 className="font-medium">Approval Rate</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {Math.round(((stats.wasteStats?.approved || 0) / (stats.totalWaste || 1)) * 100)}%
                <span className="text-sm text-gray-400 ml-1">of submissions</span>
              </p>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <TrendingUp className="w-5 h-5 text-green-400 mr-2" />
                <h3 className="font-medium">User Engagement</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {Math.round((stats.totalWaste || 0) / (stats.totalUsers || 1))}
                <span className="text-sm text-gray-400 ml-1">submissions/user</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStats;