// import React, { useEffect, useState } from 'react';
import './styles/MoviePopUp.css'
const MoviePopUp = ({ title, image, description, genre, rating, imdbLink, onClose, isAdmin, addMovie }) => {

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
    ) : addMovie ? (
        <div className = "pop-up">
            <button className="close-button" onClick={onClose}>X</button>
            <div className="pop-up-content">
                <input></input>
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
