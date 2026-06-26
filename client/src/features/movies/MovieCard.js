import '../../styles/MovieCard.css';
import { imgs } from '../../assets/imgs';

const MovieCard = ({ title, image, seen, onClick }) => {
  return (
    <div
      className={`movie-card ${seen === true ? 'seen' : ''}`}
      onClick={onClick}
    >
      <div className="image-wrapper">
        <img
          src={image && image.trim() !== '' ? image : imgs.gray_temp_img}
          alt={title}
          className="card-img-top"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = imgs.gray_temp_img;
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
