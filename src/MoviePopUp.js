// import React, { useEffect, useState } from 'react';
import './styles/MoviePopUp.css'
const MoviePopUp = ({ title, image, description, genre, rating, imdbLink, onClose, isAdmin }) => {

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
                <h2>{title}</h2>
                <p>{description}</p>
                <p>Genre: {genre.join(', ')}</p>
                <p>Rating: {rating}</p>
                <a href={imdbLink} target="_blank" rel="noopener noreferrer">IMDb Link</a>
                <button id = "delete" onClick={handleDelete}>Delete</button>
            </div>
        </div>
    ) : (
        <div className="pop-up">
        <img src={image} alt={title} className="pop-up-image" />
        
        <button className="close-button" onClick={onClose}>X</button>

        <div className="pop-up-content">
            <h2>{title}</h2>
            <p>{description}</p>
            <p>Genre: {genre.join(', ')}</p>
            <p>Rating: {rating}</p>
            <a href={imdbLink} target="_blank" rel="noopener noreferrer">IMDb Link</a>
        </div>
    </div>
    )
    );
};

export default MoviePopUp;
