import React, { useState, useContext, useEffect, useRef } from 'react';
import MovieDisplay from './MovieDisplay';
import { AuthContext } from './AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./styles/HomePage.css";
import grid from "./grid.png";
import carousel from "./carousel.png";

const HomePage = () => {
  const [viewType, setViewType] = useState('grid');
  const [sortBy, setSortType] = useState('rank');
  const [genreTypes, setGenreTypes] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);


  const toggleViewType = () => {
    setViewType(prevType => prevType === 'grid' ? 'carousel' : 'grid');
  }

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
    console.log(genreTypes);
  }

  const handleGenreTypeTagChange = (genre) => {
    setGenreTypes(genreTypes.filter((g) => g !== genre));
  };

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
    { value: 'Film-Noir', label: 'Film-Noi' },
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

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const genreReset = () => {
    setGenreTypes([]);
  }

  useEffect(() => {
    console.log(genreTypes);
  }, [genreTypes]);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setDropdownOpen(false);
        }
    }

    // Add event listener to detect clicks outside the dropdown
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
        // Clean up the event listener on component unmount
        document.removeEventListener('mousedown', handleClickOutside);
    };
    }, []);

  const { isAdmin } = useContext(AuthContext);

  return (
    <div>
        <div className = "header">
            <div className = "titles">
                <h1 className = "title">Movie Bucket List</h1>
                {isAdmin && <p id = "admin-welcome">Welcome, Admin!</p>}
            </div>


            <div className="filters">
                <img className = "filter-img" src = {grid} alt = "" onClick={toggleViewType}></img>
                <img className = "filter-img" src = {carousel} alt = "" onClick={toggleViewType}></img>

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


                <div className="dropdown" ref={dropdownRef}>
                <button
                    className="btn btn-secondary dropdown-toggle"
                    type="button"
                    onClick={toggleDropdown}
                >
                    Genre
                </button>
                <div className={`dropdown-menu${dropdownOpen ? ' show' : ''}`}>
                    <button onClick={genreReset}> Reset</button>
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

                <div className = "selected-genres-display">
                    {genreTypes.length > 0 && (
                        genreTypes.map((genre, index) => (
                            <div className="genre-tags">
                                <button className = "close-genre" onClick={() => handleGenreTypeTagChange(genre)}> x </button>
                                <p key={index} className = "genre-tag-name">{genre}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
      </div>
      <MovieDisplay viewType={viewType} sortBy={sortBy} genres={genreTypes} isAdmin = {isAdmin}/>
    </div>
  );
};

export default HomePage;
