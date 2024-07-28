import React, { useEffect, useState } from 'react';
import './styles/MoviePopUp.css'
const MoviePopUp = ({ title, image, description, genre, rating, imdbLink, onClose, isAdmin, addMovieBool }) => {

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
        seen: false,
    });

    const handleInputChange = (e)  => {
        setAddMovieTitle(e.target.value);
    }


    const deleteMovie = async () => {
        try {
            const response = await fetch('http://localhost:5001/delete-movie', {
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
            const response = await fetch('http://localhost:5001/update-seen', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title }),
            });
            if (response.ok) {
                console.log("updated");
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
            const response = await fetch('http://localhost:5001/add-movie', {
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
            fetch(`http://www.omdbapi.com/?apikey=f8451f1&t=${encodeURIComponent(newTitle)}`)
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
        <div className="pop-up">
            <img src={image} alt={title} className="pop-up-image" />
            
            <button className="close-button" onClick={onClose}>X</button>

            <div className="pop-up-content">
                <h2 className = "pop-up-title">{title}</h2>
                <p className = "pop-up-info" id = "pop-up-desc">{description}</p>
                <p className = "pop-up-info" id = "pop-up-genre">Genre: {genre.join(', ')}</p>
                <p className = "pop-up-info" id = "pop-up-rating">Rating: {rating}</p>
                <a href={imdbLink} target="_blank" rel="noopener noreferrer">IMDb Link</a>
                <button id = "delete" onClick={deleteMovie}>Delete</button>
                <button id = "seen" onClick={updateSeen}>Seen</button>
            </div>
        </div>
    ) : addMovieBool ? (
        <div className = "pop-up" id="add-movie-popup">
            <button className="close-button" onClick={onClose}>X</button>
            <div className="new-movie-input-container">
                <input type="text" placeholder="Enter movie name" value={addMovieTitle} onChange={handleInputChange} />
                <button onClick={() => searchMovie(addMovieTitle)}> Submit </button>
            </div>
            <div className = "pop-up" id = "add-movie-popup-insert">
                <img src={newMovieData.image} alt={title} className="pop-up-image" />
                <div className="pop-up-content">
                    <h2 className="pop-up-title">{newMovieData.title}</h2>
                    <p className="pop-up-info" id="pop-up-desc">{newMovieData.description}</p>
                    <p className="pop-up-info" id="pop-up-genre">Genre: {newMovieData.genre.join(', ')}</p>
                    <p className="pop-up-info" id="pop-up-rating">Rating: {newMovieData.rating}</p>
                    <a href={newMovieData.imdbLink} target="_blank" rel="noopener noreferrer">IMDb Link</a>
                    <button className="add-movie-confirm-button" onClick={() => addMovie()}> Add Movie</button>

                </div>
            </div>
        </div>
    ) : (
        <div className="pop-up">
        <img src={image} alt={title} className="pop-up-image" />
        
        <button className="close-button" onClick={onClose}>X</button>

        <div className="pop-up-content">
            <h2 className = "pop-up-title">{title}</h2>
            <p className = "pop-up-info" id = "pop-up-desc">{description}</p>
            <p className = "pop-up-info" id = "pop-up-genre">Genre: {genre.join(', ')}</p>
            <p className = "pop-up-info" id = "pop-up-rating">Rating: {rating}</p>
            <a href={imdbLink} target="_blank" rel="noopener noreferrer">IMDb Link</a>
        </div>
    </div>
    )
    );
};

export default MoviePopUp;
