package com.epoch;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class NoteController {

    @Autowired
    private NoteRepository noteRepository;

    @PostMapping("/notes")
    public Note createNote(@RequestBody Note note) {
        // TODO: Implement Cognito Authorizer
        String userId = "user123"; // Replace with actual user ID from Cognito
        note.setUserId(userId);
        note.setId(UUID.randomUUID().toString());
        return noteRepository.save(note);
    }

    @GetMapping("/notes")
    public List<Note> getAllNotes() {
        // TODO: Implement Cognito Authorizer
        String userId = "user123"; // Replace with actual user ID from Cognito
        return noteRepository.findAll().stream()
                .filter(note -> note.getUserId().equals(userId))
                .toList();
    }

    @GetMapping("/notes/{id}")
    public Note getNoteById(@PathVariable String id) {
        // TODO: Implement Cognito Authorizer
        String userId = "user123"; // Replace with actual user ID from Cognito
        return noteRepository.findById(id)
                .filter(note -> note.getUserId().equals(userId))
                .orElse(null);
    }

    @PutMapping("/notes/{id}")
    public Note updateNote(@PathVariable String id, @RequestBody Note updatedNote) {
        // TODO: Implement Cognito Authorizer
        String userId = "user123"; // Replace with actual user ID from Cognito
        return noteRepository.findById(id)
                .filter(note -> note.getUserId().equals(userId))
                .map(existingNote -> {
                    existingNote.setTitle(updatedNote.getTitle());
                    existingNote.setContent(updatedNote.getContent());
                    return noteRepository.save(existingNote);
                })
                .orElse(null);
    }

    @DeleteMapping("/notes/{id}")
    public void deleteNote(@PathVariable String id) {
        // TODO: Implement Cognito Authorizer
        String userId = "user123"; // Replace with actual user ID from Cognito
        noteRepository.findById(id)
                .filter(note -> note.getUserId().equals(userId))
                .ifPresent(note -> noteRepository.deleteById(id));
    }
}