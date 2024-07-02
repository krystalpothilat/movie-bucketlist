import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Carousel } from 'react-bootstrap';
import MovieCard from './MovieCard';
import MoviePopUp from './MoviePopUp';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/MovieDisplay.css'

const AllMovies = require('./movies/AllMovies.json');
const CurrentMovies = require('./movies/CurrentMovies.json');

const MovieDisplay = ({ viewType, sortBy, genres, isAdmin }) => {
    const [currentMovies, setCurrentMovies] = useState(AllMovies);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [loading, setLoading] = useState(false);

    const popupRef = useRef(null);
    const carouselRef = useRef(null);

    const handlePrevClick = () => {
    if (carouselRef.current) {
        carouselRef.current.prev();
    }
    };

    const handleNextClick = () => {
    if (carouselRef.current) {
        carouselRef.current.next();
    }
    };

    useEffect(() => {
        if (genres.length > 0) {
            fetchMoviesByGenres(genres);
            if(sortBy!== 'rank'){
                sortMovies("current", CurrentMovies);
            }
        } else {
        setCurrentMovies(sortBy === 'rank' ? AllMovies : sortMovies("all", AllMovies));
        }
    }, [genres, sortBy]);

    useEffect(() => {
        // Close dropdown when clicking outside
        function handleClickOutside(event) {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setSelectedMovie(null);
            }
        }
    
        // Add event listener to detect clicks outside the dropdown
        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            // Clean up the event listener on component unmount
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    

    const fetchMoviesByGenres = (genres) => {
        setLoading(true);
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
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching movies:', error);
          setLoading(false);
        });
    }
    const sortMovies = (type, moviesToSort) => {
        setLoading(true);
        if (type !== 'current' && type !== 'all') {
            console.error('Invalid type specified:', type);
            return;
        }

        fetch('http://localhost:5001/sortMovies', {
            method: 'POST', // or 'GET' depending on your server implementation
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type, movies: moviesToSort })
        })

        .then(response => response.json())
        .then(data => {
          setCurrentMovies(data); 
          setLoading(false);
        })
        .catch(error => {
          console.error('Error sorting movies:', error);
          setLoading(false);
        });
    }
    const handleCardClick = (movie) => {
      setSelectedMovie(movie);
    };
  
    const handleClosePopUp = () => {
      setSelectedMovie(null);
    };

    if (loading) {
        return <p>Loading...</p>; // Display a loading indicator while fetching or sorting
    }

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
                    seen={movie.seen}
                    onClick={() => handleCardClick(movie)}
                />
                </Col>
            ))}
            </Row>
        </Container>
        ) : (

        <Carousel slide= {false} interval={null} controls={true} wrap={false} ref={carouselRef}>
          {currentMovies.map((movie, index) => (
            <Carousel.Item key={index}>
              <div className="carousel-item-container">
                {index > 0 && (
                  <div className="carousel-item-prev" onClick={handlePrevClick}>
                    <MovieCard
                      title={currentMovies[index - 1].title}
                      description={currentMovies[index - 1].description}
                      image={currentMovies[index - 1].image}
                      genre={currentMovies[index - 1].genre}
                      rating={currentMovies[index - 1].rating}
                      year={currentMovies[index - 1].year}
                      imdbLink={currentMovies[index - 1].imdb_link}
                      seen={currentMovies[index - 1].seen}
                      onClick={() => handlePrevClick()}
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
                    seen={movie.seen}
                    onClick={() => handleCardClick(movie)}
                  />
                </div>
                {index < currentMovies.length - 1 && (
                  <div className="carousel-item-next" onClick={handleNextClick}>
                    <MovieCard
                      title={currentMovies[index + 1].title}
                      description={currentMovies[index + 1].description}
                      image={currentMovies[index + 1].image}
                      genre={currentMovies[index + 1].genre}
                      rating={currentMovies[index + 1].rating}
                      year={currentMovies[index + 1].year}
                      imdbLink={currentMovies[index + 1].imdb_link}
                      seen={currentMovies[index + 1].seen}
                      onClick={handleNextClick}
                    />
                  </div>
                )}
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
        )}

        <div ref={popupRef}> 
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
    </div>


  );
};

export default MovieDisplay;
