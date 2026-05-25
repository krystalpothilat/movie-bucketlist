import React, { useState } from 'react';
import './styles/MoviePopUp.css';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import GRAY_TEMP_IMG from './imgs/gray-temp-img.jpg';

const MoviePopUp = ({
  title,
  image,
  description,
  genre,
  rating,
  imdbLink,
  seen,
  onClose,
  isAdmin,
  addMovieBool,
}) => {
  const [addMovieTitle, setAddMovieTitle] = useState('');
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

  const handleInputChange = (e) => {
    setAddMovieTitle(e.target.value);
  };

  const deleteMovie = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/movies/delete-movie`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        }
      );
      if (response.ok) {
        onClose();
      } else {
        console.error('Error deleting movie:', await response.text());
      }
    } catch (error) {
      console.error('Error deleting movie:', error);
    }
  };

  const updateSeen = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/movies/update-seen`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        }
      );
      if (response.ok) {
        seen = !seen;
        onClose();
      } else {
        console.error('Error updating seen for movie:', await response.text());
      }
    } catch (error) {
      console.error('Error updating seen for movie:', error);
    }
  };

  const addMovie = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/movies/add-movie`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMovieData),
        }
      );
      if (response.ok) {
        onClose();
      } else {
        console.error('Error adding movie:', await response.text());
      }
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

  // Decide which data to display
  const displayImage = addMovieBool ? newMovieData.image : image;
  const displayTitle = addMovieBool ? newMovieData.title : title;
  const displayDescription = addMovieBool
    ? newMovieData.description
    : description;
  const displayGenre = addMovieBool ? newMovieData.genre : genre;
  const displayRating = addMovieBool ? newMovieData.rating : rating;
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
      <>
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
          {/* Search bar only in add-movie mode */}
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
            <p className="pop-up-info" id="pop-up-desc">
              {displayDescription}
            </p>
            <p className="pop-up-info" id="pop-up-genre">
              <span className="label">Genre:</span> {displayGenre.join(', ')}
            </p>
            <p className="pop-up-info" id="pop-up-rating">
              <span className="label">Rating:</span> {displayRating}
            </p>
            <a
              href={displayImdbLink}
              target="_blank"
              rel="noopener noreferrer"
              id="imdb-link"
            >
              IMDb Link
            </a>

            {/* Add-movie confirm button */}
            {addMovieBool && (
              <button className="add-movie-confirm-button" onClick={addMovie}>
                Add Movie
              </button>
            )}

            {/* Admin-only controls */}
            {isAdmin && !addMovieBool && (
              <>
                <div className="seen-container">
                  <label>Seen</label>
                  <div className="seen-buttons-container">
                    <Button
                      variant={seen ? 'success' : 'outline-secondary'}
                      className="seenButton"
                      onClick={updateSeen}
                    >
                      Yes
                    </Button>{' '}
                    <Button
                      variant={seen ? 'outline-secondary' : 'success'}
                      className="seenButton"
                      onClick={updateSeen}
                    >
                      No
                    </Button>
                  </div>
                </div>
                <Button
                  variant="danger"
                  className="delete-button"
                  onClick={deleteMovie}
                >
                  Delete
                </Button>
              </>
            )}

            {/* Regular user seen display */}
            {!isAdmin && !addMovieBool && (
              <p className="pop-up-info" id="pop-up-seen">
                <span className="label">Seen:</span> {seen ? 'Yes' : 'No'}
              </p>
            )}
          </div>
        </div>
      </>
    </div>
  );
};

export default MoviePopUp;
