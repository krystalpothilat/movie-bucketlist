import React from 'react';
import './styles/FiltersBar.css';

export default function FiltersBar({
  // VIEW
  viewType,
  setViewType,
  setGridView,
  setCarouselView,
  setWheelDisplayView,

  gridIcon,
  carouselIcon,
  wheelIcon,

  // SORT
  sortBy,
  handleSortTypeChange,

  // GENRES
  genres,
  genreTypes,
  handleGenreTypeChange,
  handleGenreTypeTagChange,
  genreDropdownOpen,
  toggleGenreDropdown,
  genreReset,
  genreDropdownRef,

  // SEEN
  options,
  seenToggle,
  setSeenToggle,
  handleSeenToggleChange,
  seenDropdownOpen,
  toggleSeenDropdown,
  seenDropdownRef,

  // VIEW CONDITION
  isWheelDisplayView,
}) {
  return (
    <div className="filters-container">
      {/* VIEW ICONS */}
      <div className="filters-container" id="imgs-buttons-filters">
        <div className="iconWrapper">
          <img
            className={`filter-img ${viewType === 'grid' ? 'selected' : ''}`}
            src={gridIcon}
            alt="grid"
            onClick={() => {
              setViewType('grid');
              setGridView?.();
            }}
          />
        </div>

        <div className="iconWrapper">
          <img
            className={`filter-img ${viewType === 'carousel' ? 'selected' : ''}`}
            src={carouselIcon}
            alt="carousel"
            onClick={() => {
              setViewType('carousel');
              setCarouselView?.();
            }}
          />
        </div>

        <div className="iconWrapper">
          <img
            className={`filter-img ${viewType === 'wheel' ? 'selected' : ''}`}
            src={wheelIcon}
            alt="wheel"
            onClick={() => {
              setViewType('wheel');
              setWheelDisplayView?.();
            }}
          />
        </div>
      </div>

      {/* HIDE FILTERS IN WHEEL VIEW */}
      {!isWheelDisplayView && (
        <>
          {/* SORT */}
          <select
            id="sortBySelect"
            className="form-select"
            value={sortBy}
            onChange={handleSortTypeChange}
          >
            <optgroup label="Sort By">
              <option value="rank">Rank</option>
              <option value="alphabetical">Alphabetical</option>
            </optgroup>
          </select>

          {/* GENRE */}
          <div className="dropdown" ref={genreDropdownRef}>
            <button
              className="btn btn-secondary dropdown-toggle"
              onClick={toggleGenreDropdown}
            >
              Genre
            </button>

            <div className={`dropdown-menu${genreDropdownOpen ? ' show' : ''}`}>
              <button onClick={genreReset}>Reset</button>

              {genres.map((genre) => (
                <div key={genre.value} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={genre.value}
                    checked={genreTypes.includes(genre.value)}
                    onChange={handleGenreTypeChange}
                  />
                  <label className="form-check-label">{genre.label}</label>
                </div>
              ))}
            </div>
          </div>

          {/* SEEN */}
          <div className="dropdown" ref={seenDropdownRef}>
            <button
              className="btn btn-secondary dropdown-toggle"
              onClick={toggleSeenDropdown}
            >
              Seen
            </button>

            <div className={`dropdown-menu${seenDropdownOpen ? ' show' : ''}`}>
              <button onClick={() => setSeenToggle(null)}>Reset</button>

              {options.map((option) => (
                <div key={option.value} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={option.value}
                    checked={seenToggle === option.value}
                    onChange={handleSeenToggleChange}
                  />
                  <label className="form-check-label">{option.label}</label>
                </div>
              ))}
            </div>
          </div>

          {/* SELECTED GENRES */}
          <div className="selected-genres-display">
            {genreTypes.length > 0 &&
              genreTypes.map((genre, index) => (
                <div className="genre-tags" key={index}>
                  <button
                    className="close-genre"
                    onClick={() => handleGenreTypeTagChange(genre)}
                  >
                    x
                  </button>
                  <p className="genre-tag-name">{genre}</p>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
