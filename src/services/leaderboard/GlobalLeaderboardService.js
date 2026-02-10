import LeaderboardService from "./LeaderboardService";

const MAX_ENTRIES = 10;

class GlobalLeaderboardService extends LeaderboardService {
  /**
   * @param {string} apiBaseUrl - Base URL of the API Gateway endpoint
   */
  constructor(apiBaseUrl) {
    super();
    if (!apiBaseUrl) {
      throw new Error("GlobalLeaderboardService requires an API base URL");
    }
    // Strip trailing slash for consistent URL building
    this.apiBaseUrl = apiBaseUrl.replace(/\/+$/, "");
  }

  /**
   * Make a request to the leaderboard API
   * @param {string} path - API path (e.g. "/scores")
   * @param {Object} options - fetch options
   * @returns {Promise<Object>} - Parsed JSON response
   */
  async _request(path, options = {}) {
    const url = `${this.apiBaseUrl}${path}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "Unknown error");
      throw new Error(
        `Leaderboard API error (${response.status}): ${errorBody}`
      );
    }

    return response.json();
  }

  async getTopScores(limit = MAX_ENTRIES) {
    const data = await this._request(`/scores?limit=${limit}`);
    return data.scores;
  }

  async addScore(scoreData) {
    const payload = {
      playerName: scoreData.playerName.trim().substring(0, 20),
      score: scoreData.score,
      accuracy: parseFloat(scoreData.accuracy.toFixed(2)),
      totalRounds: scoreData.totalRounds,
    };

    const data = await this._request("/scores", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return data.entry;
  }

  async isHighScore(score) {
    const scores = await this.getTopScores();
    if (scores.length < MAX_ENTRIES) return true;
    const lowestScore = scores[scores.length - 1];
    return score >= lowestScore.score;
  }

  async getScoreRank(score) {
    const scores = await this.getTopScores();

    for (let i = 0; i < scores.length; i++) {
      if (score >= scores[i].score) return i + 1;
    }

    if (scores.length < MAX_ENTRIES) return scores.length + 1;

    return null;
  }
}

export default GlobalLeaderboardService;
