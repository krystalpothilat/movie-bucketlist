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
    <Card className={`movie-card ${isClicked ? 'clicked' : ''} ${seen==='no' ? 'seen' : ''}`} onClick={handleCardClick} style={{ width: '18rem' }}>
      <Card.Img variant="top" src={image} alt={title} />
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        {/* <Card.Text>{description}</Card.Text> */}
      </Card.Body>
    </Card>
  );
};

export default MovieCard;
