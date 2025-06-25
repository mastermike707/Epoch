import com.epoch.Note;
import com.epoch.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class NoteController {

    @Autowired
    private NoteRepository noteRepository;

    @PostMapping("/notes")
    public Note createNote(@RequestBody Note note) {
        note.setId(UUID.randomUUID().toString());
        return noteRepository.save(note);
    }

    @GetMapping("/notes")
    public List<Note> getAllNotes() {
        return noteRepository.findAll();
    }

    @GetMapping("/notes/{id}")
    public Note getNoteById(@PathVariable String id) {
        return noteRepository.findById(id).orElse(null);
    }

    @PutMapping("/notes/{id}")
    public Note updateNote(@PathVariable String id, @RequestBody Note updatedNote) {
        return noteRepository.findById(id)
                .map(existingNote -> {
                    existingNote.setTitle(updatedNote.getTitle());
                    existingNote.setContent(updatedNote.getContent());
                    return noteRepository.save(existingNote);
                })
                .orElse(null);
    }

    @DeleteMapping("/notes/{id}")
    public void deleteNote(@PathVariable String id) {
        noteRepository.deleteById(id);
    }
}