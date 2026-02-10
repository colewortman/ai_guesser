import LeaderboardService from "./LeaderboardService";

const STORAGE_KEY = "ai_guesser_leaderboard";
const MAX_ENTRIES = 10;

class LocalLeaderboardService extends LeaderboardService {
  constructor() {
    super();
    this.storageKey = STORAGE_KEY;
  }

  /**
   * Read scores from localStorage
   * @returns {Array} Array of score entries from localStorage, or empty array if none or on error
   */
  _getStoredScores() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error reading leaderboard from localStorage:", error);
      return [];
    }
  }

  /**
   * Save scores to localStorage
   * @param {Array} scores - Array of score entries to save
   */
  _saveScores(scores) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(scores));
    } catch (error) {
      console.error("Error saving leaderboard to localStorage:", error);
    }
  }

  /**
   *
   * @param {Array} scores - Array of score entries to sort
   * @returns {Array} New array of scores sorted by score desc, then accuracy desc, then timestamp asc
   */
  _sortScores(scores) {
    return [...scores].sort((a, b) => {
      // Primary: higher score wins
      if (b.score !== a.score) return b.score - a.score;
      // Secondary: newer timestamp wins (reward latest achiever)
      return b.timestamp - a.timestamp;
    });
  }

  // generate a unique ID for each score entry
  _generateId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  // Public API methods
  async getTopScores(limit = MAX_ENTRIES) {
    const scores = this._getStoredScores();
    return this._sortScores(scores).slice(0, limit);
  }

  async addScore(scoreData) {
    const entry = {
      id: this._generateId(),
      playerName: scoreData.playerName.trim().substring(0, 20),
      score: scoreData.score,
      accuracy: parseFloat(scoreData.accuracy.toFixed(2)),
      totalRounds: scoreData.totalRounds,
      timestamp: Date.now(),
      gameVersion: "1.0",
    };

    const scores = this._getStoredScores();
    scores.push(entry);
    const sorted = this._sortScores(scores).slice(0, MAX_ENTRIES);
    this._saveScores(sorted);

    return entry;
  }

  async isHighScore(score) {
    const scores = await this.getTopScores();
    // If fewer than MAX_ENTRIES, any score qualifies
    if (scores.length < MAX_ENTRIES) return true;
    // Otherwise, must beat the lowest score
    const lowestScore = scores[scores.length - 1];
    return score >= lowestScore.score;
  }

  async getScoreRank(score) {
    const scores = await this.getTopScores();

    // Find where this score would rank
    for (let i = 0; i < scores.length; i++) {
      if (score >= scores[i].score) return i + 1;
    }

    // If we'd be added at the end and there's room
    if (scores.length < MAX_ENTRIES) return scores.length + 1;

    return null; // Doesn't qualify
  }
}

export default LocalLeaderboardService;
