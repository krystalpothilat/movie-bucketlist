import React, { useState, useEffect } from 'react';
import '../styles/ListPanel.css';

export default function ListPanel({
  isOpen,
  lists,
  selectedListId,
  onSelectList,
  refreshLists,
}) {
  const [creating, setCreating] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [shareListId, setShareListId] = useState(null);
  const [shareCode, setShareCode] = useState('');
  const [listMembers, setListMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joiningList, setJoiningList] = useState(false);

  // Panel is opened -> make sure the sidebar list is fresh
  useEffect(() => {
    if (isOpen) refreshLists?.();
  }, [isOpen, refreshLists]);

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
        refreshLists?.();
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
      refreshLists?.();
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
      refreshLists?.();
    } catch (err) {
      console.error('Error deleting list:', err);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const openShare = async (list) => {
    setShareListId(list.id);
    setShowMembers(false);
    setShareCode('');

    // joinCode is stored hashed, so we can't redisplay an old one —
    // always generate a fresh code when Share is opened
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/lists/${list.id}/generate-code`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );
      if (res.ok) {
        const data = await res.json();
        setShareCode(data.joinCode);
      } else {
        console.error('Error generating code:', await res.text());
      }
    } catch (err) {
      console.error('Error generating code:', err);
    }

    await fetchMembers(list.id);
  };

  const fetchMembers = async (listId) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/lists/${listId}/members`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );
      if (res.ok) {
        const data = await res.json();
        setListMembers(data);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  };

  // Shared join logic used by BOTH the top bar and the popup —
  // joins by code, refreshes the sidebar, selects the new list, and
  // pulls its movies into moviesByList via onSelectList(id, true).
  const performJoin = async (code) => {
    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_API}/api/lists/join-by-code`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ joinCode: code.trim() }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error(`Error ${res.status}: ${text}`);
      return false;
    }

    const data = await res.json();
    console.log('Joined list:', data.listName);

    await refreshLists?.();
    await onSelectList?.(data.listId, true);

    return true;
  };

  const joinListByCode = async () => {
    if (!joinCode.trim()) return;
    setJoiningList(true);
    try {
      const success = await performJoin(joinCode);
      if (success) setJoinCode('');
    } catch (err) {
      console.error('Error joining list:', err);
    } finally {
      setJoiningList(false);
    }
  };

  return (
    <div className={`list-panel ${isOpen ? 'open' : ''}`}>
      <div className="list-panel-header">
        <span className="list-panel-title">My Lists</span>
      </div>

      <div className="list-panel-join-section">
        <input
          className="list-panel-join-input"
          type="text"
          placeholder="Join by code..."
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && joinListByCode()}
        />
        <button
          className="list-panel-join-btn"
          onClick={joinListByCode}
          disabled={joiningList || !joinCode.trim()}
        >
          {joiningList ? 'Joining...' : 'Join'}
        </button>
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
                      finishEdit();
                    }}
                  >
                    Done
                  </button>
                  <button
                    className="list-panel-item-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
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
                  <div className="list-panel-item-icon-actions">
                    <button
                      className="list-panel-item-share"
                      onClick={(e) => {
                        e.stopPropagation();
                        openShare(list);
                      }}
                      title="Share"
                    >
                      ⇪
                    </button>
                    <button
                      className="list-panel-item-edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(list);
                      }}
                      title="Edit"
                    >
                      ✎
                    </button>
                  </div>
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
                onClick={confirmDelete}
              >
                Confirm
              </button>
              <button
                className="list-panel-confirm-cancel-btn"
                onClick={cancelDelete}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {shareListId && (
        <div className="list-panel-share-overlay">
          <div className="list-panel-share-modal">
            <div className="list-panel-share-header">
              Share List
              <button
                className="list-panel-share-close"
                onClick={() => {
                  setShareListId(null);
                  setShareCode('');
                  setListMembers([]);
                  setShowMembers(false);
                }}
              >
                ✕
              </button>
            </div>

            <div className="list-panel-share-body">
              <div className="list-panel-share-code-section">
                <span className="list-panel-share-label">Invite Code:</span>
                <div className="list-panel-code-display">
                  <span className="list-panel-code-value">{shareCode}</span>
                  <button
                    className="list-panel-code-copy"
                    onClick={() => {
                      navigator.clipboard.writeText(shareCode);
                      console.log('Code copied:', shareCode);
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="list-panel-members-section">
                <button
                  className="list-panel-members-toggle"
                  onClick={() => setShowMembers(!showMembers)}
                >
                  <span>{showMembers ? '▼' : '▶'}</span>
                  <span>Members ({listMembers.length})</span>
                </button>

                {showMembers && (
                  <div className="list-panel-members-list">
                    {listMembers.map((member) => (
                      <div key={member.id} className="list-panel-member-item">
                        <div className="list-panel-member-info">
                          <span className="list-panel-member-name">
                            {member.user.name || member.user.email}
                          </span>
                          <span className="list-panel-member-email">
                            {member.user.email}
                          </span>
                        </div>
                        <div className="list-panel-member-role">
                          <span
                            className={`list-panel-role-badge role-${member.role}`}
                          >
                            {member.role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
