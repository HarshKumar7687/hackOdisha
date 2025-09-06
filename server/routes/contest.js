const express = require('express');
const { protect } = require('../middleware/auth');
const { getContestEntries, createContestEntry, voteForEntry, getLeaderboard } = require('../controllers/contestController');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getContestEntries);
router.get('/leaderboard', getLeaderboard);
router.post('/', protect, upload.array('images', 5), createContestEntry);
router.post('/:entryId/vote', protect, voteForEntry);

module.exports = router;