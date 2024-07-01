import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Carousel } from 'react-bootstrap';
import MovieCard from './MovieCard';
import 'bootstrap/dist/css/bootstrap.min.css';
import './MovieDisplay.css'

const TopMovies = require('./movies/TopMovies');
const sortedTopMovies = require('./movies/sortedTopMovies');


const MovieDisplay = ({ viewType, sortBy }) => {
    const moviesToShow = sortBy === 'rank' ? TopMovies : sortedTopMovies;
    return (
    <div className = "movie-display">
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
        // <Carousel>
        // {moviesToShow.map((movie, index) => (
        //     <Carousel.Item key={index}>
        //     <MovieCard
        //         title={movie.title}
        //         description={movie.description}
        //         image={movie.image}
        //         genre={movie.genre}
        //         rating={movie.rating}
        //         year={movie.year}
        //         imdbLink={movie.imdb_link}
        //     />
        //     </Carousel.Item>
        // ))}
        // </Carousel>

        <Carousel slide= {false} interval={null} controls={true} wrap={false}>
          {moviesToShow.map((movie, index) => (
            <Carousel.Item key={index}>
              <div className="carousel-item-container">
                {index > 0 && (
                  <div className="carousel-item-prev">
                    <MovieCard
                      title={moviesToShow[index - 1].title}
                      description={moviesToShow[index - 1].description}
                      image={moviesToShow[index - 1].image}
                      genre={moviesToShow[index - 1].genre}
                      rating={moviesToShow[index - 1].rating}
                      year={moviesToShow[index - 1].year}
                      imdbLink={moviesToShow[index - 1].imdb_link}
                    />
                  </div>
                )}
                <div className="carousel-item-current">
                  <MovieCard
                    title={movie.title}
                    description={movie.description}
                    image={movie.image}
                    genre={movie.genre}
                    rating={movie.rating}
                    year={movie.year}
                    imdbLink={movie.imdb_link}
                  />
                </div>
                {index < moviesToShow.length - 1 && (
                  <div className="carousel-item-next">
                    <MovieCard
                      title={moviesToShow[index + 1].title}
                      description={moviesToShow[index + 1].description}
                      image={moviesToShow[index + 1].image}
                      genre={moviesToShow[index + 1].genre}
                      rating={moviesToShow[index + 1].rating}
                      year={moviesToShow[index + 1].year}
                      imdbLink={moviesToShow[index + 1].imdb_link}
                    />
                  </div>
                )}
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
        )}
    </div>


  );
};

export default MovieDisplay;
