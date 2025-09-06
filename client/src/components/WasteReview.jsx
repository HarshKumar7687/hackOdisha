import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Image,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { adminAPI } from "../services/api";

const WasteReview = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, [currentPage, statusFilter]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllWasteSubmissions({
        status: statusFilter,
        page: currentPage,
        limit: 10,
        search: searchQuery,
      });
      setSubmissions(response.data.wastes);
      setTotalPages(response.data.totalPages);
      setTotalSubmissions(response.data.total);
    } catch (error) {
      console.error("Failed to load submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const reviewSubmission = async (id, status) => {
    try {
      const response = await adminAPI.reviewWasteSubmission(id, { status });

      if (response.data) {
        // Update the local state with the returned data from the API
        setSubmissions((prevSubmissions) =>
          prevSubmissions.map((submission) =>
            submission._id === id
              ? { ...submission, status: response.data.status }
              : submission
          )
        );
      }
    } catch (error) {
      console.error("Failed to review submission:", error);
      console.error("Error details:", error.response?.data);
      alert(
        `Failed to update submission: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "bg-yellow-900 text-yellow-300 border-yellow-700",
      approved: "bg-green-900 text-green-300 border-green-700",
      rejected: "bg-red-900 text-red-300 border-red-700",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${statusClasses[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSubmissions();
  };

  // Function to get the correct image URL
const getImageUrl = (imagePath) => {
  // If it's already a full URL (from Cloudinary), return as is
  if (imagePath && imagePath.startsWith("http")) {
    return imagePath;
  }

  // If it's a local path, construct the full URL
  if (imagePath) {
    const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000";
    
    // Handle both formats: /uploads/filename and uploads/filename
    if (imagePath.startsWith("/uploads/")) {
      return `${baseUrl}${imagePath}`;
    } else if (imagePath.startsWith("uploads/")) {
      return `${baseUrl}/${imagePath}`;
    } else {
      return `${baseUrl}/uploads/${imagePath}`;
    }
  }

  return "https://via.placeholder.com/200x160?text=No+Image";
};

  return (
    <div className="min-h-screen w-screen bg-gray-900 text-gray-200 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Waste Management Dashboard
          </h1>
          <p className="text-gray-400">Review and manage waste submissions</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-semibold text-white">
              Waste Submissions
            </h2>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <form onSubmit={handleSearch} className="relative">
                <div className="flex items-center bg-gray-700 rounded-lg px-3 py-2 w-full md:w-64">
                  <Search className="w-4 h-4 mr-2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search submissions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-white focus:outline-none w-full"
                  />
                </div>
              </form>

              <div className="flex items-center bg-gray-700 rounded-lg px-3 py-2">
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

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400"></div>
            </div>
          ) : (
            <>
              <div className="grid gap-4 mb-6">
                {submissions.map((submission) => (
                  <div
                    key={submission._id}
                    className="bg-gray-750 rounded-lg p-5 border border-gray-700 hover:border-cyan-800 transition-colors"
                  >
                    {/* Compact layout with three columns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Left column: User info and location */}
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg text-white">
                            {submission.user?.name}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {submission.user?.email}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium flex items-center text-gray-300 mb-1">
                            <MapPin className="w-4 h-4 mr-2 text-cyan-400" />
                            Location
                          </h4>
                          <p className="text-sm text-white">
                            {submission.location}
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            {submission.type} • {submission.coins || 0} coins
                          </p>
                          {submission.mlPrediction && (
                            <p className="text-xs text-cyan-400 mt-1">
                              AI Prediction: {submission.mlPrediction.type} (
                              {submission.mlPrediction.confidence}% confidence)
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Middle column: Waste image */}
                      <div className="flex justify-center items-center">
                        <div className="w-full h-40 flex items-center justify-center">
                          <img
                            src={getImageUrl(submission.image)}
                            alt="Waste submission"
                            className="max-w-full max-h-40 object-contain rounded-lg border border-gray-700"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/200x160?text=Image+Not+Found";
                              e.target.onerror = null; // Prevent infinite loop
                            }}
                          />
                        </div>
                      </div>

                      {/* Right column: Status and actions */}
                      <div className="flex flex-col justify-between">
                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(submission.status)}
                            <span className="text-xs text-gray-400 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(
                                submission.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Approve/Reject buttons */}
                          {submission.status === "pending" && (
                            <div className="flex space-x-2 mt-2">
                              <button
                                onClick={() =>
                                  reviewSubmission(submission._id, "approved")
                                }
                                className="bg-green-800 hover:bg-green-700 px-3 py-1 rounded-lg flex items-center transition-colors text-sm"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  reviewSubmission(submission._id, "rejected")
                                }
                                className="bg-red-800 hover:bg-red-700 px-3 py-1 rounded-lg flex items-center transition-colors text-sm"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {submissions.length === 0 && (
                <div className="text-center py-10 text-gray-400 border border-gray-700 rounded-lg">
                  <Image className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-lg">No submissions found</p>
                  <p className="text-sm mt-1">
                    Try changing your filters or search query
                  </p>
                </div>
              )}

              {/* Pagination */}
              <div className="flex flex-col md:flex-row justify-between items-center mt-8 pt-5 border-t border-gray-700">
                <div className="text-sm text-gray-400 mb-4 md:mb-0">
                  Showing {submissions.length} of {totalSubmissions} submissions
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show pages around current page
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
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            currentPage === pageNum
                              ? "bg-cyan-700 text-white"
                              : "bg-gray-700 hover:bg-gray-600"
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
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-700 hover:bg-gray-600 transition-colors"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WasteReview;
