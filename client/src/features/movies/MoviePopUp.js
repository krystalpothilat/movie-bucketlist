import React, { useState, useRef } from 'react';
import '../../styles/MoviePopUp.css';
import GRAY_TEMP_IMG from '../../assets/imgs/gray-temp-img.jpg';

const Star = ({ star, currentRating, onClick, onDoubleClick }) => {
  // full, half, or empty
  const isFull = currentRating >= star;
  const isHalf = !isFull && currentRating === star - 0.5;

  return (
    <button
      className="star-btn"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {/* base: empty gray star */}
      <span className="star-base">★</span>
      {/* overlay: gold, clipped to left 100% (full) or 50% (half) */}
      {(isFull || isHalf) && (
        <span className="star-fill" style={{ width: isFull ? '100%' : '50%' }}>
          ★
        </span>
      )}
    </button>
  );
};

const MoviePopUp = ({
  title,
  image,
  description,
  genre,
  imdbLink,
  seen,
  rating,
  notes,
  onClose,
  onUpdate,
  addMovieBool,
}) => {
  const [addMovieTitle, setAddMovieTitle] = useState('');
  const [currentRating, setCurrentRating] = useState(rating ?? null);
  const [currentSeen, setCurrentSeen] = useState(seen ?? false);
  const [currentNotes, setCurrentNotes] = useState(notes ?? '');
  const [saving, setSaving] = useState(false);
  const clickTimerRef = useRef(null);
  const [newMovieData, setNewMovieData] = useState({
    title: '',
    description: '',
    genre: [],
    rating: '',
    imdb_link: '',
    imdbid: '',
    year: '',
    image: '',
    seen: false,
  });

  const handleInputChange = (e) => setAddMovieTitle(e.target.value);

  // single click: full → half → clear cycle
  const handleStarClick = (star) => {
    if (clickTimerRef.current) return;
    clickTimerRef.current = setTimeout(() => {
      clickTimerRef.current = null;
      setCurrentRating((prev) => {
        if (prev === star) return star - 0.5; // full → half
        if (prev === star - 0.5) return null; // half → clear
        return star; // else → full
      });
    }, 200);
  };

  // double click: jump straight to half
  const handleStarDoubleClick = (star) => {
    clearTimeout(clickTimerRef.current);
    clickTimerRef.current = null;
    setCurrentRating((prev) => (prev === star - 0.5 ? null : star - 0.5));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/movies/update-user-data`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            title,
            rating: currentRating,
            seen: currentSeen,
            notes: currentNotes,
          }),
        }
      );
      if (res.ok) {
        onUpdate?.(title, {
          rating: currentRating,
          seen: currentSeen,
          notes: currentNotes,
        });
      } else {
        console.error('Error saving:', await res.text());
      }
    } catch (err) {
      console.error('Error saving:', err);
    } finally {
      setSaving(false);
    }
  };

  const deleteMovie = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/movies/delete-movie`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ title }),
        }
      );
      if (response.ok) onClose();
      else console.error('Error deleting movie:', await response.text());
    } catch (error) {
      console.error('Error deleting movie:', error);
    }
  };

  const addMovie = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/movies/add-movie`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(newMovieData),
        }
      );
      if (response.ok) onClose();
      else console.error('Error adding movie:', await response.text());
    } catch (error) {
      console.error('Error adding movie:', error);
    }
  };

  const searchMovie = async (newTitle) => {
    try {
      const apiKey = process.env.REACT_APP_OMDB_API_KEY;
      if (!apiKey) {
        console.error('OMDB API key is missing');
        return;
      }
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(newTitle)}`
      );
      const data = await response.json();
      if (data.Response === 'True') {
        setNewMovieData({
          title: data.Title,
          description: data.Plot,
          genre: data.Genre.split(', '),
          rating: data.imdbRating,
          imdb_link: `https://www.imdb.com/title/${data.imdbID}/`,
          image: data.Poster,
          year: data.Year,
          imdbid: data.imdbID,
          seen: false,
        });
      } else {
        console.error(data.Error);
      }
    } catch (error) {
      console.error('Error fetching movie data:', error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      document.getElementById('submit-button').click();
    }
  };

  const displayImage = addMovieBool ? newMovieData.image : image;
  const displayTitle = addMovieBool ? newMovieData.title : title;
  const displayDescription = addMovieBool
    ? newMovieData.description
    : description;
  const displayGenre = addMovieBool ? newMovieData.genre : genre;
  const displayImdbLink = addMovieBool ? newMovieData.imdb_link : imdbLink;

  const resolvedImage =
    displayImage && displayImage.trim() !== '' && displayImage !== 'N/A'
      ? displayImage
      : GRAY_TEMP_IMG;

  return (
    <div
      className={`pop-up ${currentSeen && !addMovieBool ? 'seen' : ''}`}
      id="reg-pop-up"
    >
      <img
        src={resolvedImage}
        alt={displayTitle}
        className="pop-up-image"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = GRAY_TEMP_IMG;
        }}
      />
      <button className="close-button" onClick={onClose}>
        ×
      </button>

      <div className="pop-up-content">
        {addMovieBool && (
          <div className="new-movie-input-container">
            <input
              type="text"
              placeholder="Enter movie name"
              value={addMovieTitle}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={() => searchMovie(addMovieTitle)}
              id="submit-button"
            >
              Submit
            </button>
          </div>
        )}

        <div className="pop-up-info-container">
          <h2 className="pop-up-title">{displayTitle}</h2>

          {displayDescription && (
            <p className="pop-up-info" id="pop-up-desc">
              {displayDescription}
            </p>
          )}

          {displayGenre?.length > 0 && (
            <p className="pop-up-info" id="pop-up-genre">
              <span className="label">Genre:</span> {displayGenre.join(', ')}
            </p>
          )}

          {displayImdbLink && (
            <a
              href={displayImdbLink}
              target="_blank"
              rel="noopener noreferrer"
              id="imdb-link"
            >
              IMDb
            </a>
          )}

          {addMovieBool && (
            <button className="add-movie-confirm-button" onClick={addMovie}>
              Add Movie
            </button>
          )}

          {!addMovieBool && (
            <div className="user-controls">
              <div className="control-row">
                <span className="control-label">Seen</span>
                <div className="toggle-group">
                  <button
                    className={`toggle-btn ${currentSeen ? 'active' : ''}`}
                    onClick={() => setCurrentSeen(true)}
                  >
                    Yes
                  </button>
                  <button
                    className={`toggle-btn ${!currentSeen ? 'active' : ''}`}
                    onClick={() => setCurrentSeen(false)}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="control-row">
                <span className="control-label">Your Rating</span>
                <div className="star-buttons">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      star={star}
                      currentRating={currentRating}
                      onClick={() => handleStarClick(star)}
                      onDoubleClick={() => handleStarDoubleClick(star)}
                    />
                  ))}
                </div>
              </div>

              <div className="control-row control-row--notes">
                <span className="control-label">Notes</span>
                <textarea
                  className="notes-input"
                  value={currentNotes}
                  onChange={(e) => setCurrentNotes(e.target.value)}
                  placeholder="Add notes..."
                />
              </div>

              <div className="controls-footer">
                <button
                  className="save-btn"
                  onClick={saveAll}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button className="delete-btn" onClick={deleteMovie}>
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoviePopUp;
