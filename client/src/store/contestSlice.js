// Simple Redux implementation without @reduxjs/toolkit
import { contestAPI } from '../services/api';

// Action types
const FETCH_CONTEST_ENTRIES_START = 'contest/FETCH_CONTEST_ENTRIES_START';
const FETCH_CONTEST_ENTRIES_SUCCESS = 'contest/FETCH_CONTEST_ENTRIES_SUCCESS';
const FETCH_CONTEST_ENTRIES_FAIL = 'contest/FETCH_CONTEST_ENTRIES_FAIL';
const FETCH_LEADERBOARD_SUCCESS = 'contest/FETCH_LEADERBOARD_SUCCESS';
const SET_USER_VOTE = 'contest/SET_USER_VOTE';

// Action creators
export const fetchContestEntries = (params = {}) => async (dispatch) => {
  dispatch({ type: FETCH_CONTEST_ENTRIES_START });
  try {
    const response = await contestAPI.getContestEntries(params);
    dispatch({
      type: FETCH_CONTEST_ENTRIES_SUCCESS,
      payload: response.data
    });
  } catch (error) {
    dispatch({
      type: FETCH_CONTEST_ENTRIES_FAIL,
      payload: error.message
    });
  }
};

export const fetchLeaderboard = () => async (dispatch) => {
  try {
    const response = await contestAPI.getLeaderboard();
    dispatch({
      type: FETCH_LEADERBOARD_SUCCESS,
      payload: response.data
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
  }
};

export const voteForEntry = (entryId, voteType) => async (dispatch, getState) => {
  try {
    // Optimistic update
    dispatch({
      type: SET_USER_VOTE,
      payload: { entryId, voteType }
    });
    
    await contestAPI.voteForEntry(entryId, voteType);
    
    // Refresh data after voting
    dispatch(fetchContestEntries());
    dispatch(fetchLeaderboard());
  } catch (error) {
    console.error('Error voting:', error);
    // Revert on error by refetching
    dispatch(fetchContestEntries());
  }
};

export const setUserVote = (entryId, voteType) => ({
  type: SET_USER_VOTE,
  payload: { entryId, voteType }
});

// Helper function to process image URLs
const processEntryImages = (entry) => {
  if (entry.images && entry.images.length > 0) {
    return {
      ...entry,
      images: entry.images.map(img => {
        // Handle different image path formats
        if (img && !img.startsWith('http') && !img.startsWith('blob:')) {
          // Use environment variable or relative path
          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
          // Remove any double slashes
          return `${baseUrl.replace(/\/$/, '')}/${img.replace(/^\//, '')}`;
        }
        return img;
      })
    };
  }
  return entry;
};

// Initial state
const initialState = {
  entries: [],
  leaderboard: [],
  userVotes: {},
  loading: false,
  error: null,
};

// Reducer
const contestReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CONTEST_ENTRIES_START:
      return {
        ...state,
        loading: true,
        error: null
      };
      
    case FETCH_CONTEST_ENTRIES_SUCCESS:
      const entries = action.payload.contestEntries || action.payload || [];
      return {
        ...state,
        loading: false,
        entries: entries.map(processEntryImages),
        error: null
      };
      
    case FETCH_CONTEST_ENTRIES_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
      
    case FETCH_LEADERBOARD_SUCCESS:
      const leaderboardData = action.payload || [];
      return {
        ...state,
        leaderboard: leaderboardData
          .sort((a, b) => (b.totalVotes || b.votes || 0) - (a.totalVotes || a.votes || 0))
          .slice(0, 10)
      };
      
    case SET_USER_VOTE:
      const { entryId, voteType } = action.payload;
      const currentVote = state.userVotes[entryId];
      
      // Toggle vote if same type clicked again
      const newVote = currentVote === voteType ? null : voteType;
      
      return {
        ...state,
        userVotes: {
          ...state.userVotes,
          [entryId]: newVote
        }
      };
      
    default:
      return state;
  }
};

export default contestReducer;