class LeaderboardService {
  /**
   * Fetch top scores from the leaderboard
   * @param {number} limit - Maximum number of scores to return (default: 10)
   * @returns {Promise<Array<ScoreEntry>>} - Array of score entries, sorted by rank
   */
  async getTopScores(limit = 10) {
    throw new Error("getTopScores must be implemented by subclass");
  }

  /**
   * Add a new score to the leaderboard
   * @param {Object} scoreData - { playerName, score, accuracy, totalRounds }
   * @returns {Promise<ScoreEntry>} - The created score entry with id and timestamp
   */
  async addScore(scoreData) {
    throw new Error("addScore must be implemented by subclass");
  }

  /**
   * Check if a score qualifies for the leaderboard (top 10)
   * @param {number} score - The score to check
   * @returns {Promise<boolean>} - True if score would make the top 10
   */
  async isHighScore(score) {
    throw new Error("isHighScore must be implemented by subclass");
  }

  /**
   * Get the rank a score would achieve
   * @param {number} score - The score to check
   * @param {number} accuracy - The accuracy percentage
   * @returns {Promise<number|null>} - Rank (1-10) or null if not in top 10
   */
  async getScoreRank(score, accuracy) {
    throw new Error("getScoreRank must be implemented by subclass");
  }
}

export default LeaderboardService;
