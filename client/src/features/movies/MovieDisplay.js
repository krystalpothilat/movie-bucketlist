import React, { useState, useRef, useMemo, useEffect } from 'react';
import MovieCard from './MovieCard';
import MoviePopUp from './MoviePopUp';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/MovieDisplay.css';
import { imgs } from '../../assets/imgs';

const MovieDisplay = ({
  viewType,
  sortBy,
  genres,
  searchTitle,
  seenToggle,
  selectedListId,
  moviesByList,
  setMoviesByList,
}) => {
  const [selectedMovie, setSelectedMovie] = useState(null);

  const popupRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setSelectedMovie(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentMovies = useMemo(() => {
    // Get current movies based on selected list or all
    const allMovies = selectedListId
      ? moviesByList[selectedListId] || []
      : moviesByList.all || [];

    if (!allMovies) return [];
    let filtered = [...allMovies];

    if (genres && genres.length > 0) {
      filtered = filtered.filter(
        (movie) => movie.genre && genres.some((g) => movie.genre.includes(g))
      );
    }

    if (seenToggle === 'yes') filtered = filtered.filter((movie) => movie.seen);
    else if (seenToggle === 'no')
      filtered = filtered.filter((movie) => !movie.seen);

    if (searchTitle && searchTitle.trim()) {
      const query = searchTitle.trim().toLowerCase();
      filtered = filtered.filter(
        (movie) => movie.title && movie.title.toLowerCase().includes(query)
      );
    }

    if (searchTitle && searchTitle.trim()) {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => {
        if (b.rating == null && a.rating == null) return 0;
        if (a.rating == null) return 1;
        if (b.rating == null) return -1;
        return b.rating - a.rating;
      });
    } else {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [moviesByList, selectedListId, genres, seenToggle, searchTitle, sortBy]);

  const handleCardClick = (movie) => setSelectedMovie(movie);
  const handleClosePopUp = () => setSelectedMovie(null);

  const handleMovieUpdate = (title, updates) => {
    // Pass listId for permission verification
    const listId = selectedListId || 'all';

    setMoviesByList((prev) => {
      const newState = { ...prev };

      // Update current view (list or all)
      if (newState[listId]) {
        newState[listId] = newState[listId].map((m) =>
          m.title === title ? { ...m, ...updates } : m
        );
      }

      // Also update global "all" if not current view
      if (listId !== 'all' && newState.all) {
        newState.all = newState.all.map((m) =>
          m.title === title ? { ...m, ...updates } : m
        );
      }

      // Update any other lists that have this movie
      Object.keys(newState).forEach((cacheKey) => {
        if (cacheKey !== 'all' && cacheKey !== listId && newState[cacheKey]) {
          newState[cacheKey] = newState[cacheKey].map((m) =>
            m.title === title ? { ...m, ...updates } : m
          );
        }
      });

      return newState;
    });

    setSelectedMovie(null);
  };

  return (
    <div className="movie-display">
      <div className="movie-display-grid row justify-content-center">
        {currentMovies.map((movie, index) => (
          <div
            key={index}
            className="col-12 col-sm-6 col-md-4 d-flex justify-content-center mb-4"
          >
            <MovieCard
              title={movie.title}
              image={movie.image || imgs.gray_temp_img}
              seen={movie.seen}
              onClick={() => handleCardClick(movie)}
            />
          </div>
        ))}
      </div>

      <div id="pop-up-container" ref={popupRef}>
        {selectedMovie && (
          <MoviePopUp
            title={selectedMovie.title}
            description={selectedMovie.description}
            image={selectedMovie.image}
            genre={selectedMovie.genre}
            rating={selectedMovie.rating}
            notes={selectedMovie.notes}
            imdbLink={selectedMovie.imdbLink}
            seen={selectedMovie.seen}
            onClose={handleClosePopUp}
            onUpdate={handleMovieUpdate}
            listId={selectedListId}
          />
        )}
      </div>
    </div>
  );
};

export default MovieDisplay;
