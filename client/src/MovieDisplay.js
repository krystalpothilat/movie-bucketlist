import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Container, Row, Col, Carousel} from 'react-bootstrap';
import MovieCard from './MovieCard';
import MoviePopUp from './MoviePopUp';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/MovieDisplay.css'

const MovieDisplay = ({ viewType, sortBy, genres, searchTitle, seenToggle, isAdmin, refreshTrigger }) => {
    const [allMovies, setAllMovies] = useState([]);       // cache - full list from DB
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

    // Only fetch from DB on mount and after admin actions (add/delete/update)
    useEffect(() => {
        fetchAllMovies();
    }, [refreshTrigger]);

    // Close popup when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setSelectedMovie(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchAllMovies = () => {
        fetch(`${process.env.REACT_APP_BACKEND_API}/get-movies`, {
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
            setAllMovies(data);
            console.log('fetched all movies from DB:', data.length);
        })
        .catch(error => {
            console.error('Error fetching movies:', error);
        });
    };

    // Filter and sort entirely client-side from the cache
    const currentMovies = useMemo(() => {
        let filtered = [...allMovies];

        // Filter by genre
        if (genres.length > 0) {
            filtered = filtered.filter(movie =>
                movie.genre && genres.some(g => movie.genre.includes(g))
            );
        }

        // Filter by seen
        if (seenToggle === 'yes') {
            filtered = filtered.filter(movie => movie.seen === true);
        } else if (seenToggle === 'no') {
            filtered = filtered.filter(movie => movie.seen === false);
        }

        // Filter by search title
        if (searchTitle && searchTitle.trim()) {
            const query = searchTitle.trim().toLowerCase();
            filtered = filtered.filter(movie =>
                movie.title && movie.title.toLowerCase().includes(query)
            );
        }

        // Sort
        if (searchTitle && searchTitle.trim()) {
            filtered.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === 'rank') {
            const ranked = filtered.filter(m => m.rank != null).sort((a, b) => a.rank - b.rank);
            const unranked = filtered.filter(m => m.rank == null).sort((a, b) => a.title.localeCompare(b.title));
            filtered = [...ranked, ...unranked];
        } else {
            filtered.sort((a, b) => a.title.localeCompare(b.title));
        }

        return filtered;
    }, [allMovies, genres, seenToggle, searchTitle, sortBy]);


    const handleCardClick = (movie) => {
        setSelectedMovie(movie);
    };

    const handleClosePopUp = () => {
        setSelectedMovie(null);
    };

    return (
        <div className="movie-display">

            {viewType === 'grid' ? (
                <Container className="grid-container">
                    <Row className="grid-row">
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
                <Carousel slide={false} interval={null} controls={true} wrap={false} ref={carouselRef}>
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

            <div id="pop-up-container" ref={popupRef}>
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