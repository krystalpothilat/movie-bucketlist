import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Carousel } from 'react-bootstrap';
import MovieCard from './MovieCard';
import 'bootstrap/dist/css/bootstrap.min.css';

const TopMovies = require('./movies/TopMovies');
const sortedTopMovies = require('./movies/sortedTopMovies');


const MovieDisplay = ({ viewType, sortBy }) => {
    const moviesToShow = sortBy === 'rank' ? TopMovies : sortedTopMovies;
    return (
    <div>
        {viewType === 'grid' ? (
            <Container>
            <Row>
            {moviesToShow.map((movie, index) => (
                <Col key={index} sm={12} md={6} lg={4}>
                <MovieCard
                    title={movie.title}
                    description={movie.description}
                    image={movie.image}
                    genre={movie.genre}
                    rating={movie.rating}
                    year={movie.year}
                    imdbLink={movie.imdb_link}
                />
                </Col>
            ))}
            </Row>
        </Container>
        ) : (
        <Carousel>
        {moviesToShow.map((movie, index) => (
            <Carousel.Item key={index}>
            <MovieCard
                title={movie.title}
                description={movie.description}
                image={movie.image}
                genre={movie.genre}
                rating={movie.rating}
                year={movie.year}
                imdbLink={movie.imdb_link}
            />
            </Carousel.Item>
        ))}
        </Carousel>
        )}
    </div>


  );
};

export default MovieDisplay;
