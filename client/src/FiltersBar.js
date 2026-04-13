import React, { useState } from 'react';
import './styles/FiltersBar.css';
import filterImg from './imgs/filter.png';

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
  setSortBy,
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const closeMobileFilters = () => {
    setMobileFiltersOpen(false);
  };

  return (
    <div className="filters-container">
      {/* VIEW ICONS (always visible) */}
      <div id="imgs-buttons-filters">
        <div className="iconWrapper">
          <img
            className={`filter-img ${viewType === 'grid' ? 'selected' : ''}`}
            src={gridIcon}
            alt="grid view"
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
            alt="carousel view"
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
            alt="wheel selector"
            onClick={() => {
              setViewType('wheel');
              setWheelDisplayView?.();
            }}
          />
        </div>
      </div>

      {/* DESKTOP CONTROLS */}
      {!isWheelDisplayView && (
        <div className="filters-desktop">
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
        </div>
      )}

      {/* MOBILE FILTER BUTTON */}
      {!isWheelDisplayView && (
        <div className="filters-mobile">
          <img
            src={filterImg}
            alt="filter panel"
            className="filter-toggle-btn"
            onClick={() => setMobileFiltersOpen((p) => !p)}
          />
        </div>
      )}

      {/* MOBILE FILTER POPUP */}
      {mobileFiltersOpen && (
        <div className="filters-popup">
          {/* SORT */}
          <div className="filters-section">
            <button onClick={closeMobileFilters} className="filters-close-btn">
              ×
            </button>
            <div className="filter-section-title">Order</div>

            <label>
              <input
                type="checkbox"
                checked={sortBy === 'rank'}
                onChange={() => setSortBy('rank')}
              />
              Rank
            </label>

            <label>
              <input
                type="checkbox"
                checked={sortBy === 'alphabetical'}
                onChange={() => setSortBy('alphabetical')}
              />
              Alphabetical
            </label>
          </div>

          {/* SEEN */}
          <div className="filters-section">
            <div className="filter-section-title">Seen</div>
            {options.map((opt) => (
              <label key={opt.value}>
                <input
                  type="checkbox"
                  checked={seenToggle === opt.value}
                  onChange={handleSeenToggleChange}
                  value={opt.value}
                />
                {opt.label}
              </label>
            ))}
          </div>

          {/* GENRE */}
          <div className="filters-section">
            <div className="filter-section-title">Genres</div>
            <button className="filter-reset-btn" onClick={genreReset}>
              Reset
            </button>

            {genres.map((g) => (
              <label key={g.value}>
                <input
                  type="checkbox"
                  value={g.value}
                  checked={genreTypes.includes(g.value)}
                  onChange={handleGenreTypeChange}
                />
                {g.label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
