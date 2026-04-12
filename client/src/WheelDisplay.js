import React, { useState, useMemo, useRef, useEffect } from 'react';
import './styles/WheelDisplay.css';
import WheelSlice from './WheelSlice';
import ToastMessage from './ToastMessage';

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

const WheelDisplay = ({ allMovies = [] }) => {
  const [savedWheelDisplays, setSavedWheelDisplays] = useState([]);
  const [draftWheels, setDraftWheels] = useState([]);
  const [activeWheelDisplayId, setActiveWheelDisplayId] = useState(null);
  const [activeDraftId, setActiveDraftId] = useState(null);
  const [wheelMovies, setWheelDisplayMovies] = useState([]);
  const [wheelName, setWheelDisplayName] = useState('Date night picks');
  const [movieSearch, setMovieSearch] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [newWheelDisplayMode, setNewWheelDisplayMode] = useState(false);
  const [newWheelDisplayName, setNewWheelDisplayName] = useState('');

  const [toastAction, setToastAction] = useState(null);

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
    setWheelDisplayMovies((prev) => {
      const updated = prev.some((m) => m.title === movie.title)
        ? prev.filter((m) => m.title !== movie.title)
        : [...prev, movie];

      syncActiveDraft(updated);

      return updated;
    });

    setResult(null);
  };

  const isInWheelDisplay = (movie) =>
    wheelMovies.some((m) => m.title === movie.title);

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
    setWheelDisplayMovies([]);
    setResult(null);
    setRotation(0);

    syncActiveDraft([]);
  };

  const loadWheelDisplay = (wheel) => {
    const isDraft = !!wheel.draftId;

    setActiveWheelDisplayId(isDraft ? null : wheel._id);
    setActiveDraftId(isDraft ? wheel.draftId : null);

    setWheelDisplayName(wheel.name);
    setWheelDisplayMovies(wheel.movies || []);

    setResult(null);
    setRotation(0);
  };

  const createNewWheelDisplay = () => {
    if (!newWheelDisplayName.trim()) return;

    const draftId = Date.now().toString();

    const newDraft = {
      draftId,
      name: newWheelDisplayName,
      movies: [],
    };

    setDraftWheels((prev) => [...prev, newDraft]);

    setActiveDraftId(draftId);
    setActiveWheelDisplayId(null);

    setWheelDisplayName(newWheelDisplayName);
    setWheelDisplayMovies([]);

    setResult(null);
    setRotation(0);

    setNewWheelDisplayMode(false);
    setNewWheelDisplayName('');
  };

  const syncActiveDraft = (updatedMovies) => {
    if (!activeDraftId) return;

    setDraftWheels((prev) =>
      prev.map((d) =>
        d.draftId === activeDraftId
          ? { ...d, movies: updatedMovies, name: wheelName }
          : d
      )
    );
  };

  const getWheelDisplayFontSize = (movies, radius = 145) => {
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

  const getActiveSource = () => {
    if (activeDraftId) {
      return draftWheels.find((d) => d.draftId === activeDraftId);
    }

    if (activeWheelDisplayId) {
      return savedWheelDisplays.find((w) => w._id === activeWheelDisplayId);
    }

    return {
      name: wheelName,
      movies: wheelMovies,
    };
  };
  /// API FUNCTIONS

  const handleSaveWheel = async () => {
    const hasMovies = wheelMovies.length > 0;

    // CASE 1: Existing
    if (activeWheelDisplayId) {
      // Delete wheel if no movies
      if (!hasMovies) {
        await deleteWheel(activeWheelDisplayId);
        return;
      }

      await updateWheel(activeWheelDisplayId);
      return;
    }

    // CASE 2: New wheel
    if (hasMovies) {
      await saveWheel();
    }
  };

  // SAVE WHEEL TO DB
  const saveWheel = async () => {
    const active = getActiveSource();

    if (!active.name?.trim() || !active.movies?.length) return;

    const wheelData = {
      name: active.name,
      movies: active.movies.map((movie, i) => ({
        title: movie.title,
        color: i % COLORS.length,
      })),
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/wheels/save-wheel`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(wheelData),
        }
      );

      if (response.ok) {
        const savedWheel = await response.json();

        // move to saved state
        setSavedWheelDisplays((prev) => [...prev, savedWheel]);

        // remove from drafts
        setDraftWheels((prev) =>
          prev.filter((d) => d.draftId !== activeDraftId)
        );

        // set active saved wheel
        setActiveWheelDisplayId(savedWheel._id);
        setActiveDraftId(null);

        // sync editor
        setWheelDisplayName(savedWheel.name);
        setWheelDisplayMovies(
          (savedWheel.movies || []).map((m) => ({
            title: m.title,
          }))
        );

        setResult(null);
        setRotation(0);

        getSavedWheels();

        setToastAction({
          type: 'saved',
          id: crypto.randomUUID(),
        });

        console.log('Wheel saved successfully');
      } else {
        const errorText = await response.text();
        console.error('Error saving wheel:', errorText);
      }
    } catch (error) {
      console.error('Error saving wheel:', error);
    }
  };

  const updateWheel = async (wheelId) => {
    const wheelData = {
      name: wheelName,
      movies: wheelMovies.map((movie, i) => ({
        title: movie.title,
        color: i % COLORS.length,
      })),
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/wheels/update-wheel/${wheelId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(wheelData),
        }
      );

      if (response.ok) {
        setSavedWheelDisplays((prev) =>
          prev.map((w) => (w._id === wheelId ? { ...w, ...wheelData } : w))
        );

        setToastAction({
          type: 'updated',
          id: crypto.randomUUID(),
        });
        console.log('Wheel updated successfully');
      } else {
        const errorText = await response.text();
        console.error('Error updating wheel:', errorText);
      }
    } catch (error) {
      console.error('Error updating wheel:', error);
    }
  };

  const deleteWheel = async (wheel) => {
    if (!wheel) return;
    const isDraft = !!wheel.draftId;

    // -------------------
    // DRAFT DELETE (LOCAL ONLY)
    // -------------------
    if (isDraft) {
      setDraftWheels((prev) => prev.filter((d) => d.draftId !== wheel.draftId));

      if (activeDraftId === wheel.draftId) {
        setActiveDraftId(null);
        setWheelDisplayName('');
        setWheelDisplayMovies([]);
      }

      setToastAction({
        type: 'draft_deleted',
        id: crypto.randomUUID(),
      });

      return;
    }

    // -------------------
    // SAVED DELETE (API)
    // -------------------

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/wheels/delete-wheel/${wheel._id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(),
        }
      );

      if (response.ok) {
        console.log('Wheel deleted successfully');
        // update UI immediately
        setSavedWheelDisplays((prev) =>
          prev.filter((w) => w._id !== wheel._id)
        );
        if (activeWheelDisplayId === wheel._id) {
          setActiveWheelDisplayId(null);
          setWheelDisplayName('');
          setWheelDisplayMovies([]);
        }

        setToastAction({
          type: 'deleted',
          id: crypto.randomUUID(),
        });
      } else {
        const errorText = await response.text();
        console.error('Error deleting wheel:', errorText);
      }
    } catch (error) {
      console.error('Error deleting wheel:', error);
    }
  };

  // GET SAVED WHEELS
  const getSavedWheels = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/wheels/get-saved-wheels`,
        {
          method: 'GET',
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSavedWheelDisplays(data);
      } else {
        const errorText = await response.text();
        console.error('Error fetching wheels:', errorText);
      }
    } catch (error) {
      console.error('Error fetching wheels:', error);
    }
  };

  useEffect(() => {
    getSavedWheels();
  }, []);

  useEffect(() => {
    if (!activeDraftId) return;

    setDraftWheels((prev) =>
      prev.map((d) =>
        d.draftId === activeDraftId ? { ...d, name: wheelName } : d
      )
    );
  }, [wheelName, activeDraftId]);
  return (
    <div className="wheel-display-container">
      <ToastMessage action={toastAction} />

      {/* Left panel: saved wheels */}
      <div className="wd-panel wd-panel-left">
        <div className="wd-panel-header">Saved wheels</div>
        <div className="wd-panel-body">
          {savedWheelDisplays.map((wheel) => (
            <div
              key={wheel._id}
              className={`wd-saved-item ${wheel._id === activeWheelDisplayId ? 'active' : ''}`}
              onClick={() => loadWheelDisplay(wheel)}
            >
              <div className="wd-saved-data">
                <div className="wd-saved-name">{wheel.name}</div>
                <div className="wd-saved-count">
                  {(wheel.movies || []).length} movies
                </div>
              </div>
              <button
                className="wd-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteWheel(wheel);
                }}
              >
                ✕
              </button>
            </div>
          ))}

          {draftWheels.map((wheel) => (
            <div
              key={wheel.draftId}
              className={`wd-saved-item ${wheel.draftId === activeDraftId ? 'active' : ''}`}
              onClick={() => loadWheelDisplay(wheel)}
            >
              <div className="wd-saved-data">
                <div className="wd-saved-name">{wheel.name} (draft)</div>
                <div className="wd-saved-count">
                  {(wheel.movies || []).length} movies
                </div>
              </div>
              <button
                className="wd-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteWheel(wheel);
                }}
              >
                ✕
              </button>
            </div>
          ))}

          {newWheelDisplayMode ? (
            <div className="wd-new-wheel-form">
              <input
                className="wd-input"
                placeholder="WheelDisplay name…"
                value={newWheelDisplayName}
                onChange={(e) => setNewWheelDisplayName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createNewWheelDisplay()}
                autoFocus
              />
              <div className="wd-new-wheel-actions">
                <button className="wd-btn-sm" onClick={createNewWheelDisplay}>
                  Create
                </button>
                <button
                  className="wd-btn-sm wd-btn-ghost"
                  onClick={() => {
                    setNewWheelDisplayMode(false);
                    setNewWheelDisplayName('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              className="wd-new-wheel-btn"
              onClick={() => setNewWheelDisplayMode(true)}
            >
              + New Wheel
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
            onChange={(e) => setWheelDisplayName(e.target.value)}
            placeholder="WheelDisplay name…"
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
                        fontSize={getWheelDisplayFontSize(wheelMovies, 145)}
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
            <button className="wd-btn-secondary" onClick={handleSaveWheel}>
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
            const added = isInWheelDisplay(movie);
            return (
              <div
                key={movie.imdbid || movie.title}
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

export default WheelDisplay;
