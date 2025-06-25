import React, { useState, useEffect } from 'react';

function NoteList({ notes, setNotes, onEditNote, onDeleteNote }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch notes from the backend
    fetch('/api/notes')
      .then(response => {
        if (!response.ok) {
          throw new Error('HTTP error! Status: ' + response.status);
        }
        return response.json();
      })
      .then(data => {
        setNotes(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching notes:', error);
        setLoading(false);
      });
  }, [setNotes]);

  if (loading) {
    return <p>Loading notes...</p>;
  }

  return (
    <div>
      <h1>Notes</h1>
      <ul>
        {notes && notes.map(note => (
          <li key={note.id}>
            {note.title}
            <button onClick={() => onEditNote(note)}>Edit</button>
            <button onClick={() => onDeleteNote(note)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NoteList;