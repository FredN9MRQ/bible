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
  const [allReadings, setAllReadings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('today'); // 'today' or 'all'
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
    if (view === 'today') {
      fetchTodayReading();
    } else {
      fetchAllReadings();
    }
  }, [selectedPlan, view]);

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

  const fetchAllReadings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/reading/all/${selectedPlan}`);
      const data = await response.json();

      if (data.success) {
        setAllReadings(data.readings);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to load readings. Please check your connection.');
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

        <div className="view-toggle">
          <button
            className={`view-button ${view === 'today' ? 'active' : ''}`}
            onClick={() => setView('today')}
          >
            Today's Reading
          </button>
          <button
            className={`view-button ${view === 'all' ? 'active' : ''}`}
            onClick={() => setView('all')}
          >
            All Readings
          </button>
        </div>

        <div className="reading-card">
          {view === 'today' && (
            <div className="date-header">
              <h2>{formatDate()}</h2>
            </div>
          )}

          {view === 'all' && (
            <div className="date-header">
              <h2>All Readings - {plans[selectedPlan].name}</h2>
              <p className="overview-subtitle">
                Track your progress and catch up on missed readings
              </p>
            </div>
          )}

          {loading && <div className="loading">Loading today's reading...</div>}

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchTodayReading} className="retry-button">
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && view === 'today' && todayReading && (
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

          {!loading && !error && view === 'all' && allReadings && (
            <div className="all-readings-content">
              {Object.entries(
                allReadings.reduce((acc, reading, index) => {
                  // Calculate year and day within year for multi-year plans
                  const yearNumber = Math.floor(index / 365) + 1;
                  const dayInYear = (index % 365) + 1;

                  const monthName = reading.month_name || `Month ${reading.month}`;
                  const yearKey = `Year ${yearNumber} - ${monthName}`;

                  if (!acc[yearKey]) acc[yearKey] = [];
                  acc[yearKey].push({ ...reading, yearNumber, dayInYear, originalIndex: index });
                  return acc;
                }, {})
              ).sort((a, b) => {
                // Sort by the first reading's original index to maintain chronological order
                return a[1][0].originalIndex - b[1][0].originalIndex;
              }).map(([yearMonth, readings]) => (
                <div key={yearMonth} className="month-section">
                  <h3 className="month-header">{yearMonth}</h3>
                  <div className="readings-grid">
                    {readings.map((reading) => {
                      const key = `${selectedPlan}-${reading.originalIndex}`;
                      const completed = completedReadings[key];
                      return (
                        <div key={key} className={`reading-item ${completed ? 'completed' : ''}`}>
                          <div className="reading-item-header">
                            <span className="reading-date">Day {reading.day}</span>
                            <button
                              className="toggle-complete-small"
                              onClick={() => {
                                const newCompleted = { ...completedReadings };
                                if (newCompleted[key]) {
                                  delete newCompleted[key];
                                } else {
                                  newCompleted[key] = new Date().toISOString();
                                }
                                setCompletedReadings(newCompleted);
                                localStorage.setItem('completedReadings', JSON.stringify(newCompleted));
                              }}
                              title={completed ? 'Mark incomplete' : 'Mark complete'}
                            >
                              {completed ? '✓' : '○'}
                            </button>
                          </div>
                          <div className="reading-item-passages">
                            {reading.reading.split(',').map((passage, i) => (
                              <span key={i} className="small-passage">
                                {passage.trim()}
                              </span>
                            ))}
                          </div>
                          <button
                            className="read-button-small"
                            onClick={() => openBibleGateway(reading.reading)}
                          >
                            Read
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
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

      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </div>
  );
}

export default App;
