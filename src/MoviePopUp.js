import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import './MoviePopUp.css'
const MoviePopUp = ({ title, image, description, genre, rating, imdbLink, onClose }) => {

  const [isClicked, setIsClicked] = useState('false');

  const handleCardClick = () => {
      setIsClicked(!isClicked);
  }

  return (
    <div className="pop-up">
        <img src={image} alt={title} className="pop-up-image" />
        
        <button className="close-button" onClick={onClose}>X</button>

        <div className="pop-up-content">
            <h2>{title}</h2>
            <p>{description}</p>
            <p>Genre: {genre}</p>
            <p>Rating: {rating}</p>
            <a href={imdbLink} target="_blank" rel="noopener noreferrer">IMDb Link</a>
        </div>
    </div>
    
  );
};

export default MoviePopUp;
