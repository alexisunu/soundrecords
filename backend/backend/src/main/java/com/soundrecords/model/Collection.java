package com.soundrecords.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "collections")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Collection {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Guardamos los IDs como texto separado por comas en PostgreSQL
    // Ej: "id1,id2,id3"
    @Column(name = "spotify_album_ids", columnDefinition = "TEXT")
    @Builder.Default
    private String spotifyAlbumIds = "";

    // Convierte el String a Lista cuando el frontend lo necesita
    public List<String> getSpotifyAlbumIdsList() {
        if (spotifyAlbumIds == null || spotifyAlbumIds.isBlank()) {
            return new ArrayList<>();
        }
        return new ArrayList<>(Arrays.asList(spotifyAlbumIds.split(",")));
    }

    // Convierte la Lista a String para guardar en BD
    public void setSpotifyAlbumIdsList(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            this.spotifyAlbumIds = "";
        } else {
            this.spotifyAlbumIds = String.join(",", ids);
        }
    }

    // Agrega un ID a la lista
    public void addAlbumId(String spotifyAlbumId) {
        List<String> ids = getSpotifyAlbumIdsList();
        if (!ids.contains(spotifyAlbumId)) {
            ids.add(spotifyAlbumId);
            setSpotifyAlbumIdsList(ids);
        }
    }

    // Quita un ID de la lista
    public void removeAlbumId(String spotifyAlbumId) {
        List<String> ids = getSpotifyAlbumIdsList();
        ids.remove(spotifyAlbumId);
        setSpotifyAlbumIdsList(ids);
    }
}