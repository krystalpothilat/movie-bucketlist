import React, { useState, useEffect, useRef } from 'react';
import MovieDisplay from '../features/movies/MovieDisplay';
import MoviePopUp from '../features/movies/MoviePopUp';
import WheelDisplay from '../features/wheels/WheelDisplay';
import ListPanel from '../features/ListPanel';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/HomePage.css';
import Header from '../app/components/Header';
import FiltersBar from '../features/movies/FiltersBar';
import { useAuth } from '../app/AuthContext';

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

const HomePage = () => {
  const [viewType, setViewType] = useState('grid');
  const [sortBy, setSortType] = useState('alphabetical');
  const [genreTypes, setGenreTypes] = useState([]);
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const [seenDropdownOpen, setSeenDropdownOpen] = useState(false);
  const [listPanelOpen, setListPanelOpen] = useState(false);
  const genreDropdownRef = useRef(null);
  const seenDropdownRef = useRef(null);
  const popupRef = useRef(null);
  const [addMovieToggle, setAddMovieToggle] = useState(false);
  const [searchTitle, setSearchTitle] = useState('');
  const [seenToggle, setSeenToggle] = useState(null);
  const [popupClosed, setPopupClosed] = useState(false);
  const [allMovies, setAllMovies] = useState([]);
  const [allWheels, setAllWheels] = useState([]);
  const [selectedListId, setSelectedListId] = useState(null);
  const [moviesByList, setMoviesByList] = useState({ all: [] });

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.REACT_APP_BACKEND_API}/api/movies/get-movies`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }).then((r) => r.json()),
      fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/wheels/get-saved-wheels`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      ).then((r) => r.json()),
    ])
      .then(([movies, wheels]) => {
        setAllMovies(movies);
        setMoviesByList((prev) => ({ ...prev, all: movies }));
        setAllWheels(wheels);
      })
      .catch((err) => console.error('Error fetching data:', err));
  }, [popupClosed]);

  const handleSelectList = async (listId) => {
    setSelectedListId(listId);

    // If already cached, skip fetch
    if (moviesByList[listId]) return;

    // Fetch and cache this list's movies
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/lists/${listId}/movies`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error(`Error: ${res.status} - ${text}`);
        return;
      }

      const movies = await res.json();
      setMoviesByList((prev) => ({ ...prev, [listId]: movies }));
    } catch (err) {
      console.error(`Error fetching movies for list ${listId}:`, err);
    }
  };

  const isWheelDisplayView = viewType === 'wheel';

  const setGridView = () => setViewType('grid');
  const setWheelDisplayView = () => setViewType('wheel');

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

  const { logout } = useAuth();
  const handleLogOut = () => logout();

  return (
    <div className="main-content">
      <Header
        searchTitle={searchTitle}
        onSearchChange={setSearchTitle}
        onClearSearch={() => setSearchTitle('')}
      />

      <FiltersBar
        viewType={viewType}
        setViewType={setViewType}
        setGridView={setGridView}
        setWheelDisplayView={setWheelDisplayView}
        sortBy={sortBy}
        setSortBy={setSortType}
        handleSortTypeChange={handleSortTypeChange}
        genres={genres}
        genreTypes={genreTypes}
        handleGenreTypeChange={handleGenreTypeChange}
        handleGenreTypeTagChange={handleGenreTypeTagChange}
        genreDropdownOpen={genreDropdownOpen}
        toggleGenreDropdown={toggleGenreDropdown}
        genreReset={genreReset}
        genreDropdownRef={genreDropdownRef}
        options={options}
        seenToggle={seenToggle}
        handleSeenToggleChange={handleSeenToggleChange}
        seenDropdownOpen={seenDropdownOpen}
        toggleSeenDropdown={toggleSeenDropdown}
        seenDropdownRef={seenDropdownRef}
        isWheelDisplayView={isWheelDisplayView}
        handleLogOut={handleLogOut}
        addMovieButtonClicked={addMovieButtonClicked}
        listPanelOpen={listPanelOpen}
        toggleListPanel={() => setListPanelOpen((p) => !p)}
      />

      <div ref={popupRef}>
        {addMovieToggle && (
          <MoviePopUp onClose={handleClosePopUp} addMovieBool={true} />
        )}
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <ListPanel
          isOpen={listPanelOpen}
          selectedListId={selectedListId}
          onSelectList={handleSelectList}
        />

        <div className="page-content">
          {isWheelDisplayView ? (
            <WheelDisplay
              allMovies={allMovies}
              allWheels={allWheels}
              setAllWheels={setAllWheels}
            />
          ) : (
            <MovieDisplay
              viewType={viewType}
              sortBy={sortBy}
              genres={genreTypes}
              searchTitle={searchTitle}
              seenToggle={seenToggle}
              selectedListId={selectedListId}
              moviesByList={moviesByList}
              setMoviesByList={setMoviesByList}
            />
          )}
        </div>
      </div>

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
