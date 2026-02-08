import LocalLeaderboardService from './LocalLeaderboardService';
// Future: import GlobalLeaderboardService from './GlobalLeaderboardService';

/**
 * Service factory for the leaderboard.
 *
 * To switch to a global leaderboard later:
 * 1. Create GlobalLeaderboardService implementing the same interface
 * 2. Set USE_GLOBAL_LEADERBOARD to true (or use an environment variable)
 * 3. The rest of the app will work without changes
 */

// Configuration flag - swap implementations here
const USE_GLOBAL_LEADERBOARD = false;

let serviceInstance = null;

/**
 * Get the leaderboard service singleton.
 * Uses lazy initialization to create the service on first call.
 */
export function getLeaderboardService() {
  if (!serviceInstance) {
    if (USE_GLOBAL_LEADERBOARD) {
      // Future: serviceInstance = new GlobalLeaderboardService(process.env.REACT_APP_LEADERBOARD_API);
      throw new Error('Global leaderboard not yet implemented. Set USE_GLOBAL_LEADERBOARD to false.');
    } else {
      serviceInstance = new LocalLeaderboardService();
    }
  }
  return serviceInstance;
}

// Export for direct access if needed
export { LocalLeaderboardService };
export { default as LeaderboardService } from './LeaderboardService';
