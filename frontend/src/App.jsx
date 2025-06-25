import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import React, { useState } from 'react';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';

function App({ signOut, user }) {
  const [isCreating, setIsCreating] = useState(false);
  const [notes, setNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);

  const handleCreateNote = () => {
    setIsCreating(true);
  };

  const handleSaveNote = (updatedNote) => {
    console.log('Saving note:', updatedNote);
    setIsCreating(false);
    setEditingNote(null);
    setNotes(prevNotes =>
      prevNotes.map(note => (note.id === updatedNote.id ? updatedNote : note))
    );
  };

  const handleCancelEdit = () => {
    setIsCreating(false);
  };

  const handleDeleteNote = (noteToDelete) => {
    const url = '/api/notes/' + noteToDelete.id;
    fetch(url, {
      method: 'DELETE',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('HTTP error! Status: ' + response.status);
        }
        setNotes(prevNotes => prevNotes.filter(note => note.id !== noteToDelete.id));
      })
      .catch(error => console.error('Error deleting note:', error));
  };

  return (
    <div className="App">
      <h1>Hello {user?.username}</h1>
      <button onClick={signOut}>Sign out</button>
      <button onClick={handleCreateNote}>Create Note</button>
      <NoteList
        notes={notes}
        setNotes={setNotes}
        onEditNote={setEditingNote}
        onDeleteNote={handleDeleteNote}
      />
      {isCreating || editingNote ? (
        <NoteEditor
          note={editingNote}
          onSave={handleSaveNote}
          onCancel={handleCancelEdit}
        />
      ) : null}
    </div>
  );
}

export default withAuthenticator(App);
