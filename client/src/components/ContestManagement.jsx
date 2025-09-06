import React, { useState, useEffect } from 'react';
import { Search, Filter, Award, CheckCircle, XCircle, User, Calendar, ChevronLeft, ChevronRight, Image, Trophy } from 'lucide-react';
import { adminAPI } from '../services/api';

// Safe Image Component for Contest Management
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
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    // Handle both formats: /uploads/filename and uploads/filename
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
          <Image className="w-6 h-6 text-gray-500 mx-auto mb-1" />
          <span className="text-gray-400 text-xs">No image</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-700 animate-pulse flex items-center justify-center rounded-lg">
          <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
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

const ContestManagement = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  useEffect(() => {
    fetchEntries();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const params = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined
      };
      
      const response = await adminAPI.getAllContestEntries(params);
      
      // Process images to ensure correct URLs
      const processedEntries = (response.data.contestEntries || []).map(entry => {
        if (entry.images && entry.images.length > 0) {
          return {
            ...entry,
            images: entry.images.map(img => {
              // If image is already a full URL (Cloudinary or external), return as is
              if (img && (img.startsWith('http') || img.startsWith('blob:'))) {
                return img;
              }
              // If it's a local filename, prepend the backend URL
              const baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
              return `${baseUrl}/uploads/${img}`;
            })
          };
        }
        return entry;
      });
      
      setEntries(processedEntries);
      setTotalPages(response.data.totalPages || 1);
      setTotalEntries(response.data.total || 0);
    } catch (error) {
      console.error('Failed to load contest entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateEntry = async (id, updates) => {
    try {
      await adminAPI.updateContestEntry(id, updates);
      fetchEntries(); // Refresh the list
    } catch (error) {
      console.error('Failed to update entry:', error);
      alert('Failed to update entry');
    }
  };

  const getStatusBadge = (status) => {
    // Handle undefined or null status
    if (!status) {
      status = 'pending'; // Default to pending if status is missing
    }
    
    const statusClasses = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      approved: 'bg-green-500/20 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs border ${statusClasses[status] || statusClasses.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getStats = () => {
    const stats = {
      total: entries.length,
      pending: entries.filter(entry => entry.status === 'pending').length,
      approved: entries.filter(entry => entry.status === 'approved').length,
      rejected: entries.filter(entry => entry.status === 'rejected').length,
      winners: entries.filter(entry => entry.winner).length
    };
    return stats;
  };

  const stats = getStats();

  return (
    <div className="min-h-screen min-w-screen bg-gray-900 text-gray-100 p-6">
      <div className="bg-gray-800 p-6 rounded-none border border-gray-700 h-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Contest Management
            </h2>
            <p className="text-gray-400 mt-1">Review and manage contest submissions</p>
          </div>
          <div className="flex space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search entries..."
                className="bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-gray-600"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex items-center bg-gray-700 rounded-lg px-3 py-2 border border-gray-600">
              <Filter className="w-4 h-4 mr-2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-white focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-750 p-4 rounded-lg border-l-4 border-cyan-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Total Entries</p>
                <p className="text-2xl font-semibold mt-1">{stats.total}</p>
              </div>
              <div className="bg-cyan-500/10 p-3 rounded-full">
                <Award className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-750 p-4 rounded-lg border-l-4 border-yellow-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-semibold mt-1">{stats.pending}</p>
              </div>
              <div className="bg-yellow-500/10 p-3 rounded-full">
                <Calendar className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-750 p-4 rounded-lg border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Approved</p>
                <p className="text-2xl font-semibold mt-1">{stats.approved}</p>
              </div>
              <div className="bg-green-500/10 p-3 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-750 p-4 rounded-lg border-l-4 border-red-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Rejected</p>
                <p className="text-2xl font-semibold mt-1">{stats.rejected}</p>
              </div>
              <div className="bg-red-500/10 p-3 rounded-full">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-750 p-4 rounded-lg border-l-4 border-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Winners</p>
                <p className="text-2xl font-semibold mt-1">{stats.winners}</p>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-full">
                <Trophy className="w-5 h-5 text-purple-400" />
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
            <div className="space-y-4">
              {entries.map((entry) => (
                <div key={entry._id} className="bg-gray-750 rounded-lg p-5 border border-gray-700 hover:border-cyan-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <SafeImage 
                        src={entry.user?.avatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100'}
                        alt={entry.user?.name || 'Unknown User'}
                        className="w-12 h-12 rounded-full object-cover mr-4"
                      />
                      <div>
                        <h3 className="font-semibold text-lg flex items-center">
                          <User className="w-5 h-5 mr-2 text-cyan-400" />
                          {entry.user?.name || 'Unknown User'}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">{entry.user?.email || 'No email'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(entry.status)}
                      <span className="text-xs text-gray-400 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <h4 className="font-medium mb-2 text-gray-300">Contest Title</h4>
                      <p className="text-sm bg-gray-700 p-3 rounded-md">{entry.title}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-gray-300">Description</h4>
                      <p className="text-sm text-gray-300 bg-gray-700 p-3 rounded-md">{entry.description}</p>
                    </div>
                  </div>

                  {entry.images && entry.images.length > 0 && (
                    <div className="mb-5">
                      <h4 className="font-medium mb-2 text-gray-300 flex items-center">
                        <Image className="w-4 h-4 mr-2" />
                        Submission Images
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {entry.images.map((img, index) => (
                          <div key={index} className="relative group">
                            <SafeImage
                              src={img}
                              alt={`Contest entry ${index + 1}`}
                              className="w-24 h-24 object-cover rounded-md border border-gray-600 group-hover:border-cyan-400 transition-colors"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                              <a 
                                href={img} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-white text-xs bg-cyan-600 px-2 py-1 rounded"
                              >
                                View
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                    <div className="flex items-center">
                      <label className="relative flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={entry.winner || false}
                          onChange={(e) => updateEntry(entry._id, { winner: e.target.checked })}
                          className="sr-only"
                        />
                        <div className={`w-10 h-6 ${entry.winner ? 'bg-cyan-500' : 'bg-gray-600'} rounded-full transition-colors`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${entry.winner ? 'transform translate-x-4' : ''}`}></div>
                      </label>
                      <span className="ml-2 text-sm">Mark as winner</span>
                    </div>

                    {entry.status === 'pending' && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => updateEntry(entry._id, { status: 'approved' })}
                          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center text-sm transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => updateEntry(entry._id, { status: 'rejected' })}
                          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center text-sm transition-colors"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {entries.length === 0 && (
              <div className="text-center py-12 text-gray-400 border border-gray-700 rounded-lg mt-4">
                <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-xl">No contest entries found</p>
                <p className="mt-1">Try adjusting your search or filter criteria</p>
              </div>
            )}

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
              <div className="text-sm text-gray-400">
                Showing {entries.length} of {totalEntries} entries
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
                      <span className="px-1 text-gray-400">...</span>
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

export default ContestManagement;