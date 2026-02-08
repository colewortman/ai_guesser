import LocalLeaderboardService from "./LocalLeaderboardService";
import GlobalLeaderboardService from "./GlobalLeaderboardService";

/**
 * Service factory for the leaderboard.
 *
 * When REACT_APP_LEADERBOARD_API is set, attempts to reach the global API.
 * Falls back to local (localStorage) service if the API is unreachable.
 */

const API_URL = process.env.REACT_APP_LEADERBOARD_API;

let serviceInstance = null;
let serviceReady = null; // Promise that resolves when service is determined

/**
 * Initialize the service by checking API availability.
 * Returns a promise that resolves to the chosen service.
 */
function initService() {
  if (!API_URL) {
    serviceInstance = new LocalLeaderboardService();
    return Promise.resolve(serviceInstance);
  }

  const apiUrl = API_URL.replace(/\/+$/, "");
  return fetch(`${apiUrl}/scores?limit=1`, { method: "GET" })
    .then(() => {
      serviceInstance = new GlobalLeaderboardService(API_URL);
      return serviceInstance;
    })
    .catch(() => {
      console.warn("Global leaderboard unreachable, falling back to local.");
      serviceInstance = new LocalLeaderboardService();
      return serviceInstance;
    });
}

/**
 * Get the leaderboard service singleton.
 * Returns a promise on first call (while checking API), then returns synchronously.
 */
export function getLeaderboardService() {
  if (serviceInstance) {
    return serviceInstance;
  }

  if (!serviceReady) {
    serviceReady = initService();
  }

  return serviceReady;
}

// Export for direct access if needed
export { LocalLeaderboardService, GlobalLeaderboardService };
export { default as LeaderboardService } from "./LeaderboardService";
