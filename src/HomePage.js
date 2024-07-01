import React, { useState, useContext } from 'react';
import MovieDisplay from './MovieDisplay';
import { AuthContext } from './AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const HomePage = () => {
  const [viewType, setViewType] = useState('grid');
  const [sortBy, setSortType] = useState('rank');
  const [genreTypes, setGenreTypes] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleViewTypeChange = (e) => {
    setViewType(e.target.value);
  };

  const handleSortTypeChange = (e) => {
    setSortType(e.target.value);
  };

  const handleGenreTypeChange = (e) => {
    const genre = e.target.value;
    if (genreTypes.includes(genre)) {
      setGenreTypes(genreTypes.filter((g) => g !== genre));
    } else {
      setGenreTypes([...genreTypes, genre]);
    }
  }

  const genres = [
    { value: 'Comedy', label: 'Comedy' },
    { value: 'Drama', label: 'Drama' },
    { value: 'Thriller', label: 'Thriller' },
    { value: 'Murder', label: 'Murder' },
  ];

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const { isAdmin } = useContext(AuthContext);

  return (
    <div>
      <h1>Movie Bucket List</h1>
      {isAdmin && <p>Welcome, Admin!</p>}

      <div className="mb-3">
        <select
          id="viewTypeSelect"
          className="form-select"
          value={viewType}
          onChange={handleViewTypeChange}
        >
          <option value="grid">Grid</option>
          <option value="carousel">Carousel</option>
        </select>

        <select
          id="sortBySelect"
          className="form-select"
          value={sortBy}
          onChange={handleSortTypeChange}
        >
          <option value="rank">Rank</option>
          <option value="alphabetical">Alphabetical</option>
        </select>


        <div className="dropdown">
          <button
            className="btn btn-secondary dropdown-toggle"
            type="button"
            onClick={toggleDropdown}
          >
            Genre
          </button>
          <div className={`dropdown-menu${dropdownOpen ? ' show' : ''}`}>
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
                <label className="form-check-label" htmlFor={`genre-${genre.value}`}>
                  {genre.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <MovieDisplay viewType={viewType} sortBy={sortBy} isAdmin = {isAdmin}/>
    </div>
  );
};

export default HomePage;
