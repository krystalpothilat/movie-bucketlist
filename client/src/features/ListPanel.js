import React, { useState, useEffect } from 'react';
import '../styles/ListPanel.css';

export default function ListPanel({ isOpen, selectedListId, onSelectList }) {
  const [lists, setLists] = useState([]);
  const [creating, setCreating] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

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

  const startEdit = (list) => {
    setEditingId(list.id);
    setEditingName(list.name);
  };

  const finishEdit = async () => {
    if (!editingName.trim()) return;
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/lists/${editingId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name: editingName.trim() }),
        }
      );
      if (!res.ok) {
        const text = await res.text();
        console.error(`Error ${res.status}: ${text}`);
        return;
      }
      setEditingId(null);
      setEditingName('');
      fetchLists();
    } catch (err) {
      console.error('Error updating list:', err);
    }
  };

  const openDeleteConfirm = (listId) => {
    setDeleteConfirmId(listId);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/lists/${deleteConfirmId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error(`Error ${res.status}: ${text}`);
        return;
      }

      console.log('List deleted successfully');
      setEditingId(null);
      setEditingName('');
      setDeleteConfirmId(null);
      fetchLists();
    } catch (err) {
      console.error('Error deleting list:', err);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
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
            onClick={() => !editingId && onSelectList(list.id)}
          >
            {editingId === list.id ? (
              <div className="list-panel-item-edit-mode">
                <input
                  className="list-panel-item-edit-input"
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && finishEdit()}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="list-panel-item-edit-actions">
                  <button
                    className="list-panel-item-done-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Finishing edit:', editingId, editingName);
                      finishEdit();
                    }}
                  >
                    Done
                  </button>
                  <button
                    className="list-panel-item-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Opening delete confirm:', editingId);
                      openDeleteConfirm(editingId);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="list-panel-item-header">
                  <div>
                    <span className="list-panel-item-name">{list.name}</span>
                    <span className="list-panel-item-count">
                      {list._count?.movies ?? 0} movies
                    </span>
                  </div>
                  <button
                    className="list-panel-item-edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(list);
                    }}
                  >
                    ✎
                  </button>
                </div>
              </>
            )}
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

      {deleteConfirmId && (
        <div className="list-panel-delete-confirm-overlay">
          <div className="list-panel-delete-confirm">
            <div className="list-panel-confirm-header">Delete List</div>
            <div className="list-panel-confirm-body">
              Are you sure you want to delete this list? This action cannot be
              undone.
            </div>
            <div className="list-panel-confirm-actions">
              <button
                className="list-panel-confirm-delete-btn"
                onClick={() => {
                  console.log('Confirming delete:', deleteConfirmId);
                  confirmDelete();
                }}
              >
                Confirm
              </button>
              <button
                className="list-panel-confirm-cancel-btn"
                onClick={() => {
                  console.log('Canceling delete');
                  cancelDelete();
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
