import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, User, Mail, Calendar, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminAPI } from '../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers({
        page: currentPage,
        limit: 10,
        search: searchTerm
      });
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
      setTotalUsers(response.data.total);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId);
        fetchUsers(); // Refresh the list
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, { role: newRole });
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert('Failed to update user role');
    }
  };

  return (
    <div className="min-h-screen min-w-screen bg-gray-900 text-gray-100 p-6">
      <div className="bg-gray-800 p-6 rounded-none border border-gray-700 h-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              User Management
            </h2>
            <p className="text-gray-400 mt-1">Manage all system users and permissions</p>
          </div>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email or ID..."
              className="bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-gray-600"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-gray-750 p-4 rounded-lg border-l-4 border-cyan-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-semibold mt-1">{totalUsers}</p>
              </div>
              <div className="bg-cyan-500/10 p-3 rounded-full">
                <User className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-750 p-4 rounded-lg border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Admin Users</p>
                <p className="text-2xl font-semibold mt-1">
                  {users.filter(user => user.role === 'admin').length}
                </p>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-full">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-750 p-4 rounded-lg border-l-4 border-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Regular Users</p>
                <p className="text-2xl font-semibold mt-1">
                  {users.filter(user => user.role === 'user').length}
                </p>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-full">
                <User className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-700">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-750 text-left">
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Joined</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-t border-gray-700 hover:bg-gray-750/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-gray-300" />
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-400">ID: {user._id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="truncate max-w-xs">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user._id, e.target.value)}
                          className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end space-x-2">
                          <button className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-md transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteUser(user._id)}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="text-center py-12 text-gray-400 border border-gray-700 rounded-lg mt-4">
                <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-xl">No users found</p>
                <p className="mt-1">Try adjusting your search criteria</p>
              </div>
            )}

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
              <div className="text-sm text-gray-400">
                Showing {users.length} of {totalUsers} users
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-md bg-gray-750 border border-gray-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-md flex items-center justify-center ${
                          currentPage === pageNum 
                            ? 'bg-cyan-500 text-white' 
                            : 'bg-gray-750 border border-gray-700 hover:bg-gray-700'
                        } transition-colors`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-1">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-10 h-10 rounded-md flex items-center justify-center bg-gray-750 border border-gray-700 hover:bg-gray-700 transition-colors"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-md bg-gray-750 border border-gray-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagement;