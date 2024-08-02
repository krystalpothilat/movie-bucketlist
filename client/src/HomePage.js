import React, { useState, useContext, useEffect, useRef, } from 'react';
import {FormControl } from 'react-bootstrap';
import MovieDisplay from './MovieDisplay';
import MoviePopUp from './MoviePopUp';
import { AuthContext } from './AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./styles/HomePage.css";
import grid from "./imgs/grid.png";
import carousel from "./imgs/carousel.png";

const HomePage = () => {
  const [viewType, setViewType] = useState('grid');
  const [sortBy, setSortType] = useState('rank');
  const [genreTypes, setGenreTypes] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const popupRef = useRef(null);
  const [addMovieToggle, setAddMovieToggle] = useState(false);
  const [searchTitle , setSearchTitle] = useState('');

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

  const addMovieButtonClicked = () => {
    setAddMovieToggle(!addMovieToggle);
  };

  const handleClosePopUp = () => {
    setAddMovieToggle(false);
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

    useEffect(() => {
        // Close dropdown when clicking outside
        function handleClickOutside(event) {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setAddMovieToggle(false);
            }
        }
    
        // Add event listener to detect clicks outside the dropdown
        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            // Clean up the event listener on component unmount
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const { isAdmin, logout } = useContext(AuthContext);

    const handleLogOut = () => {
        logout();
        window.location.href = '/';
    }

  return (
    <div>
        <div className = "header">
        {isAdmin && <button id = "admin-logout" onClick={handleLogOut} > Log Out</button>}
            <div className = "titles">
                <h1 className = "title">Movie Bucket List</h1>
                {/* {isAdmin && <p id = "admin-welcome">Welcome, Admin!</p>} */}
                <div className="search-bar-container">
                    <FormControl
                        type="text"
                        placeholder="Search for a movie..."
                        className="search-bar"
                        value={searchTitle}
                        onChange={(e) => setSearchTitle(e.target.value)}
                    />
                    <button id="clear-search" onClick = {() => setSearchTitle('')}> × </button>
                </div>

            </div>



            <div className="filters-container">
                <div className="filters-container" id="imgs-buttons-filters">
                <img className={`filter-img ${viewType === 'grid' ? 'selected' : ''}`} id = "grid" src = {grid} alt = "" onClick={toggleViewType}></img>
                <img className={`filter-img ${viewType === 'carousel' ? 'selected' : ''}`} id = "carousel" src = {carousel} alt = "" onClick={toggleViewType}></img>

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

                {isAdmin && <button onClick={addMovieButtonClicked} id="add-movie-button"> Add Movie</button>}

                <div ref={popupRef}> 
                    {addMovieToggle && 
                        <MoviePopUp  onClose={handleClosePopUp} addMovieBool={true}/>
                    }
                </div>
            </div>
      </div>
      <MovieDisplay viewType={viewType} sortBy={sortBy} genres={genreTypes} searchTitle={searchTitle} isAdmin = {isAdmin} />
    
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Movie Bucket List. All rights reserved.</p>
        <p> Created by <a href="https://www.linkedin.com/in/krystalpothilat" target="_blank" rel="noopener noreferrer" id="linked-in-tag" >Krystal Pothilat</a> </p>
      </footer>
    </div>
  );
};

export default HomePage;
