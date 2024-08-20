import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Carousel} from 'react-bootstrap';
import MovieCard from './MovieCard';
import MoviePopUp from './MoviePopUp';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/MovieDisplay.css'

const MovieDisplay = ({ viewType, sortBy, genres, searchTitle, seenToggle, isAdmin, refreshTrigger }) => {
    const [currentMovies, setCurrentMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);


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
        console.log('use effect, getting movies');
        console.log('search title is ', searchTitle);
        getMovies(genres, sortBy, seenToggle, searchTitle);
    }, [genres, sortBy, seenToggle, searchTitle, refreshTrigger]);

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
    

    const getMovies = (genres, sortBy, seenToggle, searchTitle) => {
        const query = new URLSearchParams({
            genres: genres.join(','), 
            sortBy,
            seenToggle,
            searchTitle
        }).toString();
    
        fetch(`https://movie-bucketlist-server.vercel.app/get-movies?${query}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
          setCurrentMovies(data); 
          console.log('got movies');
          console.log(data);
        })
        .catch(error => {
          console.error('Error fetching movies:', error);
        });
    };


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
                    image={movie.image}
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
                      image={currentMovies[index - 1].image}
                      seen={currentMovies[index - 1].seen}
                      onClick={() => handlePrevClick()}
                    />
                  </div>
                )}
                <div className="carousel-item-current">
                  <MovieCard
                    title={movie.title}
                    image={movie.image}
                    seen={movie.seen}
                    onClick={() => handleCardClick(movie)}
                  />
                </div>
                {index < currentMovies.length - 1 && (
                  <div className="carousel-item-next" onClick={handleNextClick}>
                    <MovieCard
                      title={currentMovies[index + 1].title}
                      image={currentMovies[index + 1].image}
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

        <div id = "pop-up-container" ref={popupRef}> 
        {selectedMovie && (
            <MoviePopUp
                title={selectedMovie.title}
                description={selectedMovie.description}
                image={selectedMovie.image}
                genre={selectedMovie.genre}
                rating={selectedMovie.rating}
                imdbLink={selectedMovie.imdb_link}
                seen={selectedMovie.seen}
                onClose={handleClosePopUp}
                isAdmin={isAdmin}
            />
        )}
        </div>
    </div>


  );
};

export default MovieDisplay;
