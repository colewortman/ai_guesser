import React, { useState } from 'react';

/**
 * Form for entering player name when they achieve a high score.
 */
function HighScoreForm({ onSubmit, onSkip, rank, score, accuracy }) {
  const [playerName, setPlayerName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit(playerName);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="high-score-form">
      <h3>New High Score!</h3>
      <p className="high-score-stats">
        Rank #{rank} with {score}/10 ({accuracy}%)
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          maxLength={20}
          disabled={submitting}
          autoFocus
          className="name-input"
        />
        <div className="form-buttons">
          <button
            type="submit"
            disabled={!playerName.trim() || submitting}
            className="submit-score-button"
          >
            {submitting ? 'Saving...' : 'Submit'}
          </button>
          <button
            type="button"
            onClick={onSkip}
            disabled={submitting}
            className="skip-button"
          >
            Skip
          </button>
        </div>
      </form>
    </div>
  );
}

export default HighScoreForm;
