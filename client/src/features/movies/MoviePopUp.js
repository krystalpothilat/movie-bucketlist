import React, { useState } from 'react';
import '../../styles/MoviePopUp.css';
import GRAY_TEMP_IMG from '../../assets/imgs/gray-temp-img.jpg';

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
  addMovieBool,
}) => {
  const [addMovieTitle, setAddMovieTitle] = useState('');
  const [currentRating, setCurrentRating] = useState(rating ?? null);
  const [currentNotes, setCurrentNotes] = useState(notes ?? '');
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

  const updateRating = async (val) => {
    const newRating = currentRating === val ? null : val;
    setCurrentRating(newRating);
    await fetch(
      `${process.env.REACT_APP_BACKEND_API}/api/movies/update-rating`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, rating: newRating }),
      }
    );
  };

  const updateNotes = async () => {
    await fetch(
      `${process.env.REACT_APP_BACKEND_API}/api/movies/update-notes`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, notes: currentNotes }),
      }
    );
  };

  const updateSeen = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/movies/update-seen`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ title }),
        }
      );
      if (response.ok) onClose();
      else console.error('Error updating seen:', await response.text());
    } catch (error) {
      console.error('Error updating seen:', error);
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
      className={`pop-up ${seen && !addMovieBool ? 'seen' : ''}`}
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
                    className={`toggle-btn ${seen ? 'active' : ''}`}
                    onClick={updateSeen}
                  >
                    Yes
                  </button>
                  <button
                    className={`toggle-btn ${!seen ? 'active' : ''}`}
                    onClick={updateSeen}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="control-row">
                <span className="control-label">Your Rating</span>
                <div className="star-buttons">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`star-btn ${currentRating >= star ? 'filled' : ''}`}
                      onClick={() => updateRating(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="control-row control-row--notes">
                <span className="control-label">Notes</span>
                <textarea
                  className="notes-input"
                  value={currentNotes}
                  onChange={(e) => setCurrentNotes(e.target.value)}
                  onBlur={updateNotes}
                  placeholder="Add notes..."
                  rows={3}
                />
              </div>

              <button className="delete-btn" onClick={deleteMovie}>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoviePopUp;
