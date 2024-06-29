// src/MovieCard.js
import React from 'react';
import { Card } from 'react-bootstrap';

const MovieCard = ({ title, image, description }) => {
  return (
    <Card style={{ width: '18rem' }}>
      <Card.Img variant="top" src={image} alt={title} />
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text>{description}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default MovieCard;
