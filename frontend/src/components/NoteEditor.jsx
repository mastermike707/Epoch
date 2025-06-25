import React, { useState } from 'react';

function NoteEditor({ note, onSave, onCancel }) {
  const [title, setTitle] = useState(note ? note.title : '');
  const [content, setContent] = useState(note ? note.content : '');

  const handleSave = () => {
    const updatedNote = { title, content };
    const method = note ? 'PUT' : 'POST';
    const url = note ? `/api/notes/${note.id}` : '/api/notes';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedNote),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('HTTP error! Status: ' + response.status);
        }
        return response.json();
      })
      .then(data => {
        onSave(data); // Pass the updated/created note back to the parent component
      })
      .catch(error => console.error('Error updating/creating note:', error));
  };

  return (
    <div>
      <h2>{note ? 'Edit Note' : 'Create Note'}</h2>
      <label>Title:</label>
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} />
      <label>Content:</label>
      <textarea value={content} onChange={e => setContent(e.target.value)} />
      <button onClick={handleSave}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}

export default NoteEditor;