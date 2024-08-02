import React, { useState } from 'react';
import './styles/MoviePopUp.css'
const MoviePopUp = ({ title, image, description, genre, rating, imdbLink, seen, onClose, isAdmin, addMovieBool }) => {

    const [addMovieTitle, setAddMovieTitle] = useState('');
    const [newMovieData, setNewMovieData] = useState ({
        title: '',
        description: '',
        genre: [],
        rating: '',
        imdbLink: '',
        imdbid: '',
        year: '',
        image: '',
        seen: false
    });

    const handleInputChange = (e)  => {
        setAddMovieTitle(e.target.value);
    }


    const deleteMovie = async () => {
        try {
            const response = await fetch('http://movie-bucketlist-server.vercel.app/delete-movie', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title}),
            });
            if (response.ok) {
                console.log("deleted");
                onClose(); // close the popup and refresh the movie list
            } else {
                const errorText = await response.text();
                console.error('Error deleting movie:', errorText);
            }
        } catch (error) {
            console.error('Error deleting movie:', error);
        }
    };

    const updateSeen = async () => {
        try {
            const response = await fetch('http://movie-bucketlist-server.vercel.app/update-seen', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title }),
            });
            if (response.ok) {
                console.log("updated");
                seen = !seen;
                onClose(); // close the popup and refresh the movie list
            } else {
                const errorText = await response.text();
                console.error('Error updating seen for movie:', errorText);
            }
        } catch (error) {
            console.error('Error updating seen for movie:', error);
        }
    };

    const addMovie = async () => {
        try {
            const response = await fetch('http://movie-bucketlist-server.vercel.app/add-movie', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newMovieData),
            });
            if (response.ok) {
                console.log("Movie added successfully");
                onClose(); // Close the popup if needed

            } else {
                const errorText = await response.text();
                console.error('Error adding movie:', errorText);
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
            fetch(`http://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(newTitle)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.Response === "True") {
                        console.log(data);
                        setNewMovieData({
                        title: data.Title,
                        description: data.Plot,
                        genre: data.Genre.split(', '),
                        rating: data.imdbRating,
                        imdbLink: `https://www.imdb.com/title/${data.imdbID}/`,
                        image: data.Poster,
                        year: data.Year,
                        imdbid: data.imdbID,
                        seen: false,
                    });
                        console.log("api fetch successful")
                    } else {
                        console.error(data.Error);
                    }
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        } catch (error) {
            console.error('Error updating seen for movie:', error);
        }
    };

  return (
    isAdmin ? (
        <div className="pop-up" id="admin-pop-up">
            <img src={image} alt={title} className="pop-up-image" />
            
            <button className="close-button" onClick={onClose}> × </button>

            <div className="pop-up-content">
                <h2 className = "pop-up-title">{title}</h2>
                <p className = "pop-up-info" id = "pop-up-desc">{description}</p>
                <p className = "pop-up-info" id = "pop-up-genre"><span className="label">Genre:</span> {genre.join(', ')}</p>
                <p className = "pop-up-info" id = "pop-up-rating"><span className="label">Rating:</span> {rating}</p>
                <a href={imdbLink} target="_blank" rel="noopener noreferrer" id="imdb-link">IMDb Link</a>
                <div className = "seen-container">
                    <label> Seen </label>
                    <div className = "seen-buttons-container">
                        <button className = {`seenButton ${seen ? 'chosen' : ''}`} id = "seen-yes" onClick={updateSeen}>Yes</button>
                        <button className = {`seenButton ${!seen ? 'chosen' : ''}`} id = "seen-no" onClick={updateSeen}>No</button>
                    </div>
                </div>

                <button className="delete-button" onClick={deleteMovie}>Delete</button>
            </div>
        </div>
    ) : addMovieBool ? (
        <div className = "pop-up" id="add-movie-popup">
            <button className="close-button" onClick={onClose}> × </button>
            <div className="new-movie-input-container">
                <input type="text" placeholder="Enter movie name" value={addMovieTitle} onChange={handleInputChange} />
                <button onClick={() => searchMovie(addMovieTitle)}> Submit </button>
            </div>
            <div className = "pop-up" id = "add-movie-popup-insert">
                <img src={newMovieData.image} alt={title} className="pop-up-image" />
                <div className="pop-up-content">
                    <h2 className="pop-up-title">{newMovieData.title}</h2>
                    <p className="pop-up-info" id="pop-up-desc">{newMovieData.description}</p>
                    <p className="pop-up-info" id="pop-up-genre"> <span className="label">Genre:</span> {newMovieData.genre.join(', ')}</p>
                    <p className="pop-up-info" id="pop-up-rating"> <span className="label">Rating:</span> {newMovieData.rating}</p>
                    <a href={newMovieData.imdbLink} target="_blank" rel="noopener noreferrer" id="imdb-link" >IMDb Link</a>
                    <button className="add-movie-confirm-button" onClick={() => addMovie()}> Add Movie</button>

                </div>
            </div>
        </div>
    ) : (
        <div className="pop-up" id="reg-pop-up">
            <img src={image} alt={title} className="pop-up-image" />
            
            <button className="close-button" onClick={onClose}> × </button>

            <div className="pop-up-content">
                <h2 className = "pop-up-title">{title}</h2>
                <p className = "pop-up-info" id = "pop-up-desc">{description}</p>
                <p className = "pop-up-info" id = "pop-up-genre"> <span className="label">Genre:</span> {genre.join(', ')}</p>
                <p className = "pop-up-info" id = "pop-up-rating"> <span className="label">Rating:</span> {rating}</p>
                <p className = "pop-up-info" id = "pop-up-seen"><span className="label">Seen:</span> {seen ? 'Yes' : 'No'}</p>
                <a href={imdbLink} target="_blank" rel="noopener noreferrer" id="imdb-link" >IMDb Link</a>
            </div>
        </div>
    )
    );
};

export default MoviePopUp;
