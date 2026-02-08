import { useState, useEffect, useCallback } from "react";
import { getLeaderboardService } from "../services/leaderboard";

/**
 * Custom hook for leaderboard operations.
 * Wraps the leaderboard service with React state management.
 *
 * @returns {Object} Leaderboard state and operations
 */
export function useLeaderboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const service = getLeaderboardService();

  /**
   * Fetch the top scores from the leaderboard
   */
  const fetchScores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const topScores = await service.getTopScores();
      setScores(topScores);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }, [service]);

  /**
   * Add a new score to the leaderboard
   * @param {Object} scoreData - { playerName, score, accuracy, totalRounds }
   * @returns {Promise<ScoreEntry>} The created entry
   */
  const addScore = useCallback(
    async (scoreData) => {
      try {
        const entry = await service.addScore(scoreData);
        await fetchScores(); // Refresh the list after adding
        return entry;
      } catch (err) {
        setError(err.message);
        console.error("Error adding score:", err);
        throw err;
      }
    },
    [service, fetchScores],
  );

  /**
   * Check if a score qualifies for the leaderboard
   * @param {number} score - The score to check
   * @returns {Promise<boolean>}
   */
  const checkHighScore = useCallback(
    async (score) => {
      try {
        return await service.isHighScore(score);
      } catch (err) {
        console.error("Error checking high score:", err);
        return false;
      }
    },
    [service],
  );

  /**
   * Get the rank a score would achieve
   * @param {number} score - The score
   * @param {number} accuracy - The accuracy percentage
   * @returns {Promise<number|null>} Rank 1-10 or null
   */
  const getScoreRank = useCallback(
    async (score, accuracy) => {
      try {
        return await service.getScoreRank(score, accuracy);
      } catch (err) {
        console.error("Error getting score rank:", err);
        return null;
      }
    },
    [service],
  );

  // Fetch scores on mount
  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  return {
    scores,
    loading,
    error,
    addScore,
    checkHighScore,
    getScoreRank,
    refreshScores: fetchScores,
  };
}

export default useLeaderboard;
