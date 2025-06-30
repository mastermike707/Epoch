package com.epoch;

public class Note {
    private String id;
    private String title;
        private String content;
        private String userId;

    public Note() {}

    public Note(String id, String title, String content) {
        this.id = id;
        this.title = title;
        this.content = content;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
            }
        
            public String getUserId() {
                return userId;
            }
        
            public void setUserId(String userId) {
                this.userId = userId;
            }
        }