package com.soundrecords.controller;

import com.soundrecords.dto.AlbumResponse;
import com.soundrecords.model.User;
import com.soundrecords.service.SpotifyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/spotify")
@RequiredArgsConstructor
public class SpotifyController {

    private final SpotifyService spotifyService;

    @GetMapping("/search")
    public ResponseEntity<List<AlbumResponse>> search(
            @RequestParam String q,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String year) {

        return ResponseEntity.ok(
                spotifyService.searchAlbums(q, genre, year));
    }

    @GetMapping("/albums/{spotifyAlbumId}")
    public ResponseEntity<AlbumResponse> getAlbum(
            @PathVariable String spotifyAlbumId) {

        return ResponseEntity.ok(
                spotifyService.getAlbumById(spotifyAlbumId));
    }

    @GetMapping("/albums/{spotifyAlbumId}")
    public ResponseEntity<AlbumResponse> getAlbum(
            @PathVariable String spotifyAlbumId,
            @AuthenticationPrincipal User user) {

        // user puede ser null si no está autenticado
        UUID userId = user != null ? user.getId() : null;

        return ResponseEntity.ok(
                spotifyService.getAlbumById(spotifyAlbumId, userId));
    }
}