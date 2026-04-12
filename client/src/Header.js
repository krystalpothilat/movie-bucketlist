import React from 'react';
import { FormControl } from 'react-bootstrap';
import './styles/Header.css';

export default function Header({ searchTitle, onSearchChange, onClearSearch }) {
  return (
    <div className="header">
      <div className="titles">
        <h1 className="title">Movie Bucket List</h1>

        <div className="search-bar-container">
          <FormControl
            type="text"
            placeholder="Search for a movie..."
            className="search-bar"
            value={searchTitle}
            onChange={(e) => onSearchChange(e.target.value)}
          />

          <button className="clearSearchBar" onClick={onClearSearch}>
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
