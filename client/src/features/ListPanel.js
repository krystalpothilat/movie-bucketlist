import React, { useState, useEffect } from 'react';
import '../styles/ListPanel.css';

export default function ListPanel({ isOpen, selectedListId, onSelectList }) {
  const [lists, setLists] = useState([]);
  const [creating, setCreating] = useState(false);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    if (isOpen) fetchLists();
  }, [isOpen]);

  const fetchLists = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/lists/get-lists`,
        {
          credentials: 'include',
        }
      );
      if (res.ok) setLists(await res.json());
    } catch (err) {
      console.error('Error fetching lists:', err);
    }
  };

  const createList = async () => {
    if (!newListName.trim()) return;
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/lists/create`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name: newListName.trim() }),
        }
      );
      if (res.ok) {
        setNewListName('');
        setCreating(false);
        fetchLists();
      }
    } catch (err) {
      console.error('Error creating list:', err);
    }
  };

  return (
    <div className={`list-panel ${isOpen ? 'open' : ''}`}>
      <div className="list-panel-header">
        <span className="list-panel-title">My Lists</span>
      </div>

      <div className="list-panel-body">
        {lists.map((list) => (
          <div
            key={list.id}
            className={`list-panel-item ${selectedListId === list.id ? 'active' : ''}`}
            onClick={() => onSelectList(list.id)}
          >
            <div className="list-panel-item-header">
              <div>
                <span className="list-panel-item-name">{list.name}</span>
                <span className="list-panel-item-count">
                  {list._count?.movies ?? 0} movies
                </span>
              </div>
              <button
                className="list-panel-item-edit"
                onClick={(e) => e.stopPropagation()}
              >
                ✎
              </button>
            </div>
          </div>
        ))}

        {!creating && (
          <button
            className="list-panel-new-btn"
            onClick={() => setCreating(true)}
          >
            + New List
          </button>
        )}

        {lists.length === 0 && !creating && (
          <p className="list-panel-empty">No lists yet.</p>
        )}

        {creating && (
          <div className="list-panel-create-form">
            <input
              className="list-panel-input"
              type="text"
              placeholder="List name..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createList()}
              autoFocus
            />
            <div className="list-panel-create-actions">
              <button className="list-panel-btn-primary" onClick={createList}>
                Create
              </button>
              <button
                className="list-panel-btn-ghost"
                onClick={() => {
                  setCreating(false);
                  setNewListName('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="list-panel-footer"></div>
    </div>
  );
}
