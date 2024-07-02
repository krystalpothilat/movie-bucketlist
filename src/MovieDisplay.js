import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Carousel } from 'react-bootstrap';
import MovieCard from './MovieCard';
import MoviePopUp from './MoviePopUp';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/MovieDisplay.css'

const TopMovies = require('./movies/TopMovies.json');
const sortedTopMovies = require('./movies/sortedTopMovies.json');
// const CurrentMovies = require('./movies/CurrentMovies.json');

const MovieDisplay = ({ viewType, sortBy, genres, isAdmin }) => {
    const [currentMovies, setCurrentMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    useEffect(() => {
        if (genres.length > 0) {
            fetchMoviesByGenres(genres);
        }else {
            setCurrentMovies(sortBy === 'rank' ? TopMovies : sortedTopMovies);
          }
    }, [genres, sortBy]);

    const fetchMoviesByGenres = (genres) => {
        console.log("fetching");
        fetch('http://localhost:5001/getMoviesByGenres', {
            method: 'POST', // or 'GET' depending on your server implementation
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ genres })
        })

        .then(response => response.json())
        .then(data => {
          setCurrentMovies(data); 
        })
        .catch(error => {
          console.error('Error fetching movies:', error);
        });
    }

    const handleCardClick = (movie) => {
      setSelectedMovie(movie);
    };
  
    const handleClosePopUp = () => {
      setSelectedMovie(null);
    };

    return (
    <div className = "movie-display">
        {viewType === 'grid' ? (
            <Container className = "grid-container">
            <Row className = "grid-row">
            {currentMovies.map((movie, index) => (
                <Col key={index} sm={12} md={6} lg={4}>
                <MovieCard
                    title={movie.title}
                    description={movie.description}
                    image={movie.image}
                    genre={movie.genre}
                    rating={movie.rating}
                    year={movie.year}
                    imdbLink={movie.imdb_link}
                    onClick={() => handleCardClick(movie)}
                />
                </Col>
            ))}
            </Row>
        </Container>
        ) : (

        <Carousel slide= {false} interval={null} controls={true} wrap={false}>
          {currentMovies.map((movie, index) => (
            <Carousel.Item key={index}>
              <div className="carousel-item-container">
                {index > 0 && (
                  <div className="carousel-item-prev">
                    <MovieCard
                      title={currentMovies[index - 1].title}
                      description={currentMovies[index - 1].description}
                      image={currentMovies[index - 1].image}
                      genre={currentMovies[index - 1].genre}
                      rating={currentMovies[index - 1].rating}
                      year={currentMovies[index - 1].year}
                      imdbLink={currentMovies[index - 1].imdb_link}
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
                    onClick={() => handleCardClick(movie)}
                  />
                </div>
                {index < currentMovies.length - 1 && (
                  <div className="carousel-item-next">
                    <MovieCard
                      title={currentMovies[index + 1].title}
                      description={currentMovies[index + 1].description}
                      image={currentMovies[index + 1].image}
                      genre={currentMovies[index + 1].genre}
                      rating={currentMovies[index + 1].rating}
                      year={currentMovies[index + 1].year}
                      imdbLink={currentMovies[index + 1].imdb_link}
                    />
                  </div>
                )}
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
        )}

        
        {selectedMovie && (
            <MoviePopUp
                title={selectedMovie.title}
                description={selectedMovie.description}
                image={selectedMovie.image}
                genre={selectedMovie.genre}
                rating={selectedMovie.rating}
                imdbLink={selectedMovie.imdb_link}
                onClose={handleClosePopUp}
                isAdmin={isAdmin}
            />
        )}
    </div>


  );
};

export default MovieDisplay;
