import React, { useState, useContext, useEffect, useRef } from 'react';
import { FormControl } from 'react-bootstrap';
import MovieDisplay from './MovieDisplay';
import MoviePopUp from './MoviePopUp';
import Wheel from './Wheel';
import { AuthContext } from './AuthContext';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/HomePage.css';
import grid from './imgs/grid.png';
import carousel from './imgs/carousel.png';

const HomePage = () => {
  const [viewType, setViewType] = useState('grid'); // 'grid' | 'carousel' | 'wheel'
  const [sortBy, setSortType] = useState('rank');
  const [genreTypes, setGenreTypes] = useState([]);
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const [seenDropdownOpen, setSeenDropdownOpen] = useState(false);
  const genreDropdownRef = useRef(null);
  const seenDropdownRef = useRef(null);
  const popupRef = useRef(null);
  const [addMovieToggle, setAddMovieToggle] = useState(false);
  const [searchTitle, setSearchTitle] = useState('');
  const [seenToggle, setSeenToggle] = useState(null);
  const [popupClosed, setPopupClosed] = useState(false);
  const [allMovies, setAllMovies] = useState([]);

  // Fetch all movies once so Wheel can use them without its own fetch
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_API}/get-movies`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((data) => setAllMovies(data))
      .catch((err) => console.error('Error fetching movies:', err));
  }, [popupClosed]);

  const isWheelView = viewType === 'wheel';

  const setGridView = () => setViewType('grid');
  const setCarouselView = () => setViewType('carousel');
  const setWheelView = () => setViewType('wheel');

  const handleSortTypeChange = (e) => setSortType(e.target.value);

  const handleGenreTypeChange = (e) => {
    const genre = e.target.value;
    setGenreTypes((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleGenreTypeTagChange = (genre) => {
    setGenreTypes((prev) => prev.filter((g) => g !== genre));
  };

  const addMovieButtonClicked = () => setAddMovieToggle((prev) => !prev);

  const handleClosePopUp = () => {
    setAddMovieToggle(false);
    setPopupClosed((prev) => !prev);
  };

  const handleSeenToggleChange = (event) => {
    const { value } = event.target;
    if (value === 'yes') {
      setSeenToggle((prev) => (prev == null || prev === 'no' ? 'yes' : null));
    } else if (value === 'no') {
      setSeenToggle((prev) => (prev == null || prev === 'yes' ? 'no' : null));
    }
  };

  const options = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
  ];

  const genres = [
    { value: 'Action', label: 'Action' },
    { value: 'Adventure', label: 'Adventure' },
    { value: 'Animation', label: 'Animation' },
    { value: 'Biography', label: 'Biography' },
    { value: 'Comedy', label: 'Comedy' },
    { value: 'Crime', label: 'Crime' },
    { value: 'Drama', label: 'Drama' },
    { value: 'Family', label: 'Family' },
    { value: 'Fantasy', label: 'Fantasy' },
    { value: 'Film-Noir', label: 'Film-Noir' },
    { value: 'History', label: 'History' },
    { value: 'Horror', label: 'Horror' },
    { value: 'Musical', label: 'Musical' },
    { value: 'Mystery', label: 'Mystery' },
    { value: 'Romance', label: 'Romance' },
    { value: 'Sci-Fi', label: 'Sci-Fi' },
    { value: 'Thriller', label: 'Thriller' },
    { value: 'War', label: 'War' },
    { value: 'Western', label: 'Western' },
  ];

  const toggleGenreDropdown = () => setGenreDropdownOpen((prev) => !prev);
  const toggleSeenDropdown = () => setSeenDropdownOpen((prev) => !prev);
  const genreReset = () => setGenreTypes([]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        genreDropdownRef.current &&
        !genreDropdownRef.current.contains(event.target)
      ) {
        setGenreDropdownOpen(false);
      }
      if (
        seenDropdownRef.current &&
        !seenDropdownRef.current.contains(event.target)
      ) {
        setSeenDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setAddMovieToggle(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { isAdmin, logout } = useContext(AuthContext);
  const handleLogOut = () => logout();

  return (
    <div className="main-content">
      <div className="header">
        <div className="titles">
          <h1 className="title">Movie Bucket List</h1>
          {/* Hide search bar in wheel view — not relevant there */}
          {!isWheelView && (
            <div className="search-bar-container">
              <FormControl
                type="text"
                placeholder="Search for a movie..."
                className="search-bar"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
              />
              <button id="clear-search" onClick={() => setSearchTitle('')}>
                {' '}
                ×{' '}
              </button>
            </div>
          )}
        </div>

        <div className="filters-container">
          <div className="filters-container" id="imgs-buttons-filters">
            {/* Grid icon */}
            <div className="iconWrapper">
              <img
                className={`filter-img ${viewType === 'grid' ? 'selected' : ''}`}
                id="grid"
                src={grid}
                alt="grid view"
                onClick={setGridView}
              />
            </div>
            {/* Carousel icon */}
            <div className="iconWrapper">
              <img
                className={`filter-img ${viewType === 'carousel' ? 'selected' : ''}`}
                id="carousel"
                src={carousel}
                alt="carousel view"
                onClick={setCarouselView}
              />
            </div>
            {/* Wheel icon */}
            <button
              className={`wheel-view-btn ${viewType === 'wheel' ? 'selected' : ''}`}
              onClick={setWheelView}
              title="Wheel view"
              aria-label="Wheel view"
            >
              {/* Simple SVG wheel icon */}
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="9.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <circle
                  cx="11"
                  cy="11"
                  r="2.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <line
                  x1="11"
                  y1="1.5"
                  x2="11"
                  y2="8.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <line
                  x1="11"
                  y1="13.5"
                  x2="11"
                  y2="20.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <line
                  x1="1.5"
                  y1="11"
                  x2="8.5"
                  y2="11"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <line
                  x1="13.5"
                  y1="11"
                  x2="20.5"
                  y2="11"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <line
                  x1="3.4"
                  y1="3.4"
                  x2="8.3"
                  y2="8.3"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <line
                  x1="13.7"
                  y1="13.7"
                  x2="18.6"
                  y2="18.6"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <line
                  x1="18.6"
                  y1="3.4"
                  x2="13.7"
                  y2="8.3"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <line
                  x1="8.3"
                  y1="13.7"
                  x2="3.4"
                  y2="18.6"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Hide sort/filter controls in wheel view */}
          {!isWheelView && (
            <>
              <select
                id="sortBySelect"
                className="form-select"
                value={sortBy}
                onChange={handleSortTypeChange}
              >
                <optgroup label="Sort By">
                  <option value="rank">Rank</option>
                  <option value="alphabetical">Alphabetical</option>
                </optgroup>
              </select>

              <div className="dropdown" ref={genreDropdownRef}>
                <button
                  className="btn btn-secondary dropdown-toggle"
                  type="button"
                  onClick={toggleGenreDropdown}
                >
                  Genre
                </button>
                <div
                  className={`dropdown-menu${genreDropdownOpen ? ' show' : ''}`}
                >
                  <button onClick={genreReset}>Reset</button>
                  {genres.map((genre) => (
                    <div key={genre.value} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value={genre.value}
                        id={`genre-${genre.value}`}
                        checked={genreTypes.includes(genre.value)}
                        onChange={handleGenreTypeChange}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`genre-${genre.value}`}
                      >
                        {genre.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dropdown" ref={seenDropdownRef}>
                <button
                  className="btn btn-secondary dropdown-toggle"
                  type="button"
                  onClick={toggleSeenDropdown}
                >
                  Seen
                </button>
                <div
                  className={`dropdown-menu${seenDropdownOpen ? ' show' : ''}`}
                >
                  <button onClick={() => setSeenToggle(null)}>Reset</button>
                  {options.map((option) => (
                    <div key={option.value} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="seenToggle"
                        value={option.value}
                        id={`seen-${option.value}`}
                        checked={seenToggle === option.value}
                        onChange={handleSeenToggleChange}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`seen-${option.value}`}
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="selected-genres-display">
                {genreTypes.length > 0 &&
                  genreTypes.map((genre, index) => (
                    <div className="genre-tags" key={index}>
                      <button
                        className="close-genre"
                        onClick={() => handleGenreTypeTagChange(genre)}
                      >
                        x
                      </button>
                      <p className="genre-tag-name">{genre}</p>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>

        {isAdmin && (
          <div className="admin-buttons">
            <Button
              variant="warning"
              onClick={addMovieButtonClicked}
              id="add-movie-button"
            >
              Add Movie
            </Button>{' '}
            <Button
              variant="secondary"
              id="admin-logout"
              onClick={handleLogOut}
            >
              Log Out
            </Button>{' '}
          </div>
        )}

        <div ref={popupRef}>
          {addMovieToggle && (
            <MoviePopUp onClose={handleClosePopUp} addMovieBool={true} />
          )}
        </div>
      </div>

      {/* Main content area — swaps between MovieDisplay and Wheel */}
      {isWheelView ? (
        <Wheel allMovies={allMovies} />
      ) : (
        <MovieDisplay
          viewType={viewType}
          sortBy={sortBy}
          genres={genreTypes}
          searchTitle={searchTitle}
          seenToggle={seenToggle}
          isAdmin={isAdmin}
          refreshTrigger={popupClosed}
        />
      )}

      <footer className="footer">
        <p>
          &copy; {new Date().getFullYear()} Movie Bucket List. All rights
          reserved.
        </p>
        <p>
          Created by{' '}
          <a
            href="https://www.linkedin.com/in/krystalpothilat"
            target="_blank"
            rel="noopener noreferrer"
            id="linked-in-tag"
          >
            Krystal Pothilat
          </a>
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
