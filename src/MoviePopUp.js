// import React, { useEffect, useState } from 'react';
import './styles/MoviePopUp.css'
const MoviePopUp = ({ title, image, description, genre, rating, imdbLink, onClose, isAdmin, addMovie }) => {

  const handleDelete = async () => {
    try {
        await fetch('http://localhost:5001/delete-movie', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title}),
        });

        onClose(); // Close popup or refresh the movie list
    } catch (error) {
        console.error('Error deleting movie:', error);
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
                <button id = "delete" onClick={handleDelete}>Delete</button>
                <button id = "seen" onClick={handleDelete}>Seen</button>
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
