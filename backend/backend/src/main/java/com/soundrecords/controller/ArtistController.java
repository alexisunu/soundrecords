package com.soundrecords.controller;

import com.soundrecords.dto.*;
import com.soundrecords.model.User;
import com.soundrecords.service.ArtistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/artists")
@RequiredArgsConstructor
public class ArtistController {

    private final ArtistService artistService;

    @PostMapping
    public ResponseEntity<ArtistResponse> createArtist(
            @RequestBody ArtistRequest request,
            @AuthenticationPrincipal User user) {

        return ResponseEntity.status(201)
                .body(artistService.createArtist(user, request));
    }

    @GetMapping("/discover")
    public ResponseEntity<List<ArtistResponse>> discover() {
        return ResponseEntity.ok(artistService.discoverArtists());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArtistResponse> getPublicProfile(
            @PathVariable UUID id) {
        return ResponseEntity.ok(artistService.getPublicProfile(id));
    }

    @GetMapping("/me/dashboard")
    public ResponseEntity<ArtistDashboardResponse> getDashboard(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(artistService.getDashboard(user));
    }

    @PutMapping("/me")
    public ResponseEntity<ArtistResponse> updateArtist(
            @RequestBody ArtistRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                artistService.updateArtist(user, request));
    }

    @PatchMapping("/me/boost")
    public ResponseEntity<ArtistResponse> toggleBoost(
            @RequestBody Map<String, Boolean> body,
            @AuthenticationPrincipal User user) {

        Boolean active = body.get("active");
        if (active == null) {
            throw new IllegalArgumentException(
                    "El campo 'active' es obligatorio");
        }

        return ResponseEntity.ok(
                artistService.toggleBoost(user, active));
    }
}