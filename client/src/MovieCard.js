import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import './styles/MovieCard.css'

const MovieCard = ({ title, image, description, genre, rating, imdbLink, seen, onClick }) => {

  const [isClicked, setIsClicked] = useState('false');

  const handleCardClick = () => {
      setIsClicked(!isClicked);
      onClick();
  }

  return (
    <Card className={`movie-card ${isClicked ? 'clicked' : ''} ${seen===true ? 'seen' : ''}`} onClick={handleCardClick} style={{ width: '18rem' }}>
      <div className="image-wrapper">
        <Card.Img variant="top" src={image} alt={title} className="card-img-top" />
      </div>
      <Card.Body>
        <Card.Title className="movie-title">{title}</Card.Title>
      </Card.Body>
    </Card>
  );
};

export default MovieCard;
