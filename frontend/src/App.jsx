import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function App() {
  // Load saved plan preference (defaults to 24_month for 2-year plan)
  const [selectedPlan, setSelectedPlan] = useState(() => {
    const saved = localStorage.getItem('selectedPlan');
    return saved || '24_month';
  });

  const [todayReading, setTodayReading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedReadings, setCompletedReadings] = useState(() => {
    const saved = localStorage.getItem('completedReadings');
    return saved ? JSON.parse(saved) : {};
  });

  // Auto dark mode based on system preference
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const plans = {
    '12_month': { name: '1 Year Plan', desc: '4 chapters per day' },
    '24_month': { name: '2 Year Plan', desc: '2 chapters per day' },
    '48_month': { name: '4 Year Plan', desc: 'Relaxed pace' }
  };

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Save plan preference when changed
  useEffect(() => {
    localStorage.setItem('selectedPlan', selectedPlan);
  }, [selectedPlan]);

  useEffect(() => {
    fetchTodayReading();
  }, [selectedPlan]);

  const fetchTodayReading = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/reading/today/${selectedPlan}`);
      const data = await response.json();

      if (data.success) {
        setTodayReading(data.reading);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to load reading. Please check your connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCompleted = (readingKey) => {
    const newCompleted = { ...completedReadings };
    if (newCompleted[readingKey]) {
      delete newCompleted[readingKey];
    } else {
      newCompleted[readingKey] = new Date().toISOString();
    }
    setCompletedReadings(newCompleted);
    localStorage.setItem('completedReadings', JSON.stringify(newCompleted));
  };

  const openBibleGateway = (passage, version = 'CSB') => {
    const encodedPassage = encodeURIComponent(passage);
    const url = `https://www.biblegateway.com/passage/?search=${encodedPassage}&version=${version}`;
    window.open(url, '_blank');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadingKey = (reading) => {
    if (!reading) return null;
    return `${selectedPlan}-${reading.month}-${reading.day}`;
  };

  const isCompleted = (reading) => {
    const key = getReadingKey(reading);
    return key && completedReadings[key];
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>M'Cheyne Bible Reading Plan</h1>
          <p className="subtitle">
            A TBC Decatur study together,<br />
            Love God, Love People, and Make Disciples.
          </p>
        </div>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </header>

      <main className="container">
        <div className="plan-selector">
          <h2>Choose Your Plan</h2>
          <div className="plan-buttons">
            {Object.entries(plans).map(([key, plan]) => (
              <button
                key={key}
                className={`plan-button ${selectedPlan === key ? 'active' : ''}`}
                onClick={() => setSelectedPlan(key)}
              >
                <div className="plan-name">{plan.name}</div>
                <div className="plan-desc">{plan.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="reading-card">
          <div className="date-header">
            <h2>{formatDate()}</h2>
          </div>

          {loading && <div className="loading">Loading today's reading...</div>}

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchTodayReading} className="retry-button">
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && todayReading && (
            <div className="reading-content">
              <div className="reading-header">
                <h3>Today's Reading</h3>
                <button
                  className={`complete-button ${isCompleted(todayReading) ? 'completed' : ''}`}
                  onClick={() => toggleCompleted(getReadingKey(todayReading))}
                >
                  {isCompleted(todayReading) ? '✓ Completed' : 'Mark Complete'}
                </button>
              </div>

              <div className="passages">
                {todayReading.reading.split(',').map((passage, index) => {
                  const trimmedPassage = passage.trim();
                  return (
                    <div key={index} className="passage-item">
                      <span className="passage-text">{trimmedPassage}</span>
                      <button
                        className="read-button"
                        onClick={() => openBibleGateway(trimmedPassage)}
                        title="Open in Bible Gateway"
                      >
                        Read →
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="reading-actions">
                <button
                  className="action-button primary"
                  onClick={() => {
                    const allPassages = todayReading.reading;
                    openBibleGateway(allPassages);
                  }}
                >
                  Read All Passages
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="info-section">
          <h3>About M'Cheyne Reading Plan</h3>
          <p>
            This reading plan was created by Robert Murray M'Cheyne in 1842.
            It helps you read through the entire Bible systematically, with daily readings
            from different parts of Scripture.
          </p>
          <ul>
            <li><strong>1 Year Plan:</strong> Read 4 chapters daily</li>
            <li><strong>2 Year Plan:</strong> Read 2 chapters daily</li>
            <li><strong>4 Year Plan:</strong> Read at a more relaxed pace</li>
          </ul>
        </div>
      </main>

      <footer className="footer">
        <p>Bible text provided by Bible Gateway</p>
      </footer>
    </div>
  );
}

export default App;
