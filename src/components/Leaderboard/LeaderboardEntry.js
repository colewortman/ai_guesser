import React from 'react';

/**
 * Individual leaderboard entry row.
 * Displays rank, player name, score, and accuracy.
 */
function LeaderboardEntry({ rank, entry, isHighlighted }) {
  // Medal emojis for top 3
  const rankDisplay = rank === 1 ? '1' : rank === 2 ? '2' : rank === 3 ? '3' : rank;
  const medal = rank === 1 ? ' ' : rank === 2 ? ' ' : rank === 3 ? ' ' : '';

  return (
    <div className={`leaderboard-entry ${isHighlighted ? 'highlighted' : ''} ${rank <= 3 ? `rank-${rank}` : ''}`}>
      <span className="rank-col">
        {medal}{rankDisplay}
      </span>
      <span className="name-col" title={entry.playerName}>
        {entry.playerName}
      </span>
      <span className="score-col">{entry.score}/10</span>
      <span className="accuracy-col">{entry.accuracy.toFixed(0)}%</span>
    </div>
  );
}

export default LeaderboardEntry;
