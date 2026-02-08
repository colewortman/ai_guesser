import React from 'react';
import LeaderboardEntry from './LeaderboardEntry';
import './Leaderboard.css';

/**
 * Leaderboard display component.
 * Shows top 10 scores in a grid layout.
 */
function Leaderboard({ scores, loading, highlightId }) {
  if (loading) {
    return (
      <div className="leaderboard">
        <h3>Leaderboard</h3>
        <div className="leaderboard-loading">Loading...</div>
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <div className="leaderboard">
        <h3>Leaderboard</h3>
        <p className="leaderboard-empty">No scores yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <h3>Top Scores</h3>
      <div className="leaderboard-header">
        <span className="rank-col">Rank</span>
        <span className="name-col">Player</span>
        <span className="score-col">Score</span>
        <span className="accuracy-col">Acc</span>
      </div>
      <div className="leaderboard-entries">
        {scores.map((entry, index) => (
          <LeaderboardEntry
            key={entry.id}
            rank={index + 1}
            entry={entry}
            isHighlighted={entry.id === highlightId}
          />
        ))}
      </div>
    </div>
  );
}

export default Leaderboard;
