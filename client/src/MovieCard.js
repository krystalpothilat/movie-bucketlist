import React, { useState } from 'react';
import './styles/MovieCard.css'
import GRAY_TEMP_IMG from './imgs/gray-temp-img.jpg';

const MovieCard = ({ title, image, seen, onClick }) => {

  const [isClicked, setIsClicked] = useState(false);

  const handleCardClick = () => {
      setIsClicked(!isClicked);
      onClick();
  }

  return (
    <div className={`movie-card ${isClicked ? 'clicked' : ''} ${seen === true ? 'seen' : ''}`} onClick={handleCardClick}>
      <div className="image-wrapper">
<img
    src={image && image.trim() !== '' ? image : GRAY_TEMP_IMG}
    alt={title}
    className="card-img-top"
    onError={(e) => {
        e.target.onerror = null;
        e.target.src = GRAY_TEMP_IMG;
    }}
/>
      </div>
      <div className="card-body">
        <p className="movie-title">{title}</p>
      </div>
    </div>
  );
};

export default MovieCard;