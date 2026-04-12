import React, { useState, useMemo, useRef } from 'react';
import './styles/Wheel.css';
import WheelSlice from './WheelSlice';

const COLORS = [
  { bg: '#B5D4F4', text: '#0C447C' },
  { bg: '#9FE1CB', text: '#085041' },
  { bg: '#FAC775', text: '#633806' },
  { bg: '#F4C0D1', text: '#72243E' },
  { bg: '#CECBF6', text: '#3C3489' },
  { bg: '#C0DD97', text: '#27500A' },
  { bg: '#F0997B', text: '#712B13' },
  { bg: '#5DCAA5', text: '#04342C' },
];

const MOCK_SAVED_WHEELS = [
  { id: 1, name: 'Date night picks', movies: [] },
  { id: 2, name: 'Friday horror', movies: [] },
];

const Wheel = ({ allMovies = [] }) => {
  const [savedWheels, setSavedWheels] = useState(MOCK_SAVED_WHEELS);
  const [activeWheelId, setActiveWheelId] = useState(1);
  const [wheelMovies, setWheelMovies] = useState([]);
  const [wheelName, setWheelName] = useState('Date night picks');
  const [movieSearch, setMovieSearch] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [newWheelMode, setNewWheelMode] = useState(false);
  const [newWheelName, setNewWheelName] = useState('');

  const wheelRef = useRef(null);

  // Filter movies based on search
  const filteredMovies = useMemo(() => {
    if (!movieSearch.trim()) return allMovies;
    const q = movieSearch.trim().toLowerCase();
    return allMovies.filter(
      (m) => m.title && m.title.toLowerCase().includes(q)
    );
  }, [allMovies, movieSearch]);

  const toggleMovie = (movie) => {
    setWheelMovies((prev) =>
      prev.some((m) => m.title === movie.title)
        ? prev.filter((m) => m.title !== movie.title)
        : [...prev, movie]
    );
    setResult(null);
  };

  const isInWheel = (movie) => wheelMovies.some((m) => m.title === movie.title);

  // Spin logic
  const spin = () => {
    if (wheelMovies.length < 2 || spinning) return;
    setResult(null);
    setSpinning(true);

    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const segAngle = 360 / wheelMovies.length;
    const winnerIndex = Math.floor(Math.random() * wheelMovies.length);
    const targetAngle =
      360 * extraSpins + (360 - winnerIndex * segAngle - segAngle / 2);
    const newRotation = rotation + targetAngle;

    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(wheelMovies[winnerIndex]);
    }, 4000);
  };

  const clearAll = () => {
    setWheelMovies([]);
    setResult(null);
    setRotation(0);
  };

  const saveWheel = () => {
    if (!wheelName.trim() || wheelMovies.length === 0) return;

    setSavedWheels((prev) => {
      const exists = prev.find((w) => w.id === activeWheelId);
      if (exists) {
        return prev.map((w) =>
          w.id === activeWheelId
            ? { ...w, name: wheelName, movies: wheelMovies }
            : w
        );
      }
      const newId = Date.now();
      setActiveWheelId(newId);
      return [...prev, { id: newId, name: wheelName, movies: wheelMovies }];
    });
  };

  const loadWheel = (wheel) => {
    setActiveWheelId(wheel.id);
    setWheelName(wheel.name);
    setWheelMovies(wheel.movies || []);
    setResult(null);
    setRotation(0);
  };

  const createNewWheel = () => {
    if (!newWheelName.trim()) return;
    const newId = Date.now();
    const newWheel = { id: newId, name: newWheelName, movies: [] };
    setSavedWheels((prev) => [...prev, newWheel]);
    setActiveWheelId(newId);
    setWheelName(newWheelName);
    setWheelMovies([]);
    setResult(null);
    setRotation(0);
    setNewWheelMode(false);
    setNewWheelName('');
  };

  const getWheelFontSize = (movies, radius = 145) => {
    if (!movies.length) return 13;
    const boxW = radius - 5 - 20 - 5; // 115
    const longestTitle = movies.reduce(
      (max, m) => (m.title.length > max.length ? m.title : max),
      ''
    );
    for (let size = 13; size >= 9; size--) {
      if (longestTitle.length * (size * 0.52) <= boxW) return size;
    }
    return 9;
  };

  return (
    <div className="wheel-display-container">
      {/* Left panel: saved wheels */}
      <div className="wd-panel wd-panel-left">
        <div className="wd-panel-header">Saved wheels</div>
        <div className="wd-panel-body">
          {savedWheels.map((wheel) => (
            <div
              key={wheel.id}
              className={`wd-saved-item ${wheel.id === activeWheelId ? 'active' : ''}`}
              onClick={() => loadWheel(wheel)}
            >
              <div className="wd-saved-name">{wheel.name}</div>
              <div className="wd-saved-count">
                {(wheel.movies || []).length} movies
              </div>
            </div>
          ))}

          {newWheelMode ? (
            <div className="wd-new-wheel-form">
              <input
                className="wd-input"
                placeholder="Wheel name…"
                value={newWheelName}
                onChange={(e) => setNewWheelName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createNewWheel()}
                autoFocus
              />
              <div className="wd-new-wheel-actions">
                <button className="wd-btn-sm" onClick={createNewWheel}>
                  Create
                </button>
                <button
                  className="wd-btn-sm wd-btn-ghost"
                  onClick={() => {
                    setNewWheelMode(false);
                    setNewWheelName('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              className="wd-new-wheel-btn"
              onClick={() => setNewWheelMode(true)}
            >
              + new wheel
            </button>
          )}
        </div>
      </div>

      {/* Center panel: wheel */}
      <div className="wd-panel wd-panel-center">
        <div className="wd-panel-header">
          <input
            className="wd-wheel-name-input"
            value={wheelName}
            onChange={(e) => setWheelName(e.target.value)}
            placeholder="Wheel name…"
          />
        </div>
        <div className="wd-wheel-wrap">
          <div className="wd-wheel-svg-wrap">
            <svg viewBox="0 0 320 320" className="wd-wheel-svg">
              <g
                transform={`translate(160,160) rotate(${rotation})`}
                style={{
                  transition: spinning
                    ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 1)'
                    : 'none',
                }}
                ref={wheelRef}
              >
                {/* EMPTY STATE */}
                {wheelMovies.length === 0 ? (
                  <>
                    <circle
                      className="wd-wheel-empty-circle"
                      cx="0"
                      cy="0"
                      r="145"
                    />
                    <text
                      x="0"
                      y="-5"
                      textAnchor="middle"
                      className="wd-wheel-empty-text"
                    >
                      Add movies
                    </text>
                    <text
                      x="0"
                      y="15"
                      textAnchor="middle"
                      className="wd-wheel-empty-text"
                    >
                      from the right →
                    </text>
                  </>
                ) : (
                  <>
                    {/* SLICES */}
                    {wheelMovies.map((movie, i) => (
                      <WheelSlice
                        key={movie.title}
                        index={i}
                        total={wheelMovies.length}
                        radius={145}
                        movie={movie}
                        fontSize={getWheelFontSize(wheelMovies, 145)}
                        color={COLORS[i % COLORS.length]}
                      />
                    ))}

                    {/* CENTER HUB */}
                    <circle
                      className="wd-wheel-center-circle"
                      cx="0"
                      cy="0"
                      r="20"
                    />
                  </>
                )}
              </g>

              {/* POINTER (ALWAYS OUTSIDE ROTATION) */}
              <polygon
                className="wd-wheel-pointer"
                points="250,13 239,38 261,38"
              />
            </svg>
          </div>
        </div>

        {result ? (
          <div className="wd-result">
            <span className="wd-result-label">Tonight's pick:</span>
            <span className="wd-result-title">{result.title}</span>
          </div>
        ) : null}

        <div className="wd-actions">
          <button
            className="wd-spin-btn"
            onClick={spin}
            disabled={spinning || wheelMovies.length < 2}
          >
            {spinning ? 'Spinning…' : 'Spin the wheel'}
          </button>
          <div className="wd-action-row">
            <button className="wd-btn-secondary" onClick={saveWheel}>
              Save wheel
            </button>
            <button className="wd-btn-secondary" onClick={clearAll}>
              Clear all
            </button>
          </div>
        </div>
      </div>

      {/* Right panel: movie picker */}
      <div className="wd-panel wd-panel-right">
        <div className="wd-panel-header">
          <span>Add movies</span>
          <span className="wd-count-badge">{wheelMovies.length} added</span>
        </div>
        <div className="wd-panel-body">
          <input
            className="wd-movie-search"
            placeholder="Search movies…"
            value={movieSearch}
            onChange={(e) => setMovieSearch(e.target.value)}
          />
          {filteredMovies.length === 0 ? (
            <p className="wd-no-results">No movies found</p>
          ) : null}
          {filteredMovies.map((movie, i) => {
            const added = isInWheel(movie);
            return (
              <div
                key={i}
                className={`wd-movie-item ${added ? 'added' : ''}`}
                onClick={() => toggleMovie(movie)}
              >
                <span className="wd-movie-title">{movie.title}</span>
                <span className="wd-add-icon">{added ? '✓' : '+'}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Wheel;
