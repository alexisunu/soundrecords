package com.soundrecords.controller;

import com.soundrecords.dto.*;
import com.soundrecords.model.User;
import com.soundrecords.service.CollectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/collections")
@RequiredArgsConstructor
public class CollectionController {

    private final CollectionService collectionService;

    @GetMapping("/me")
    public ResponseEntity<List<CollectionResponse>> getMyCollections(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(
                collectionService.getMyCollections(user));
    }

    @PostMapping
    public ResponseEntity<CollectionResponse> create(
            @RequestBody CollectionRequest request,
            @AuthenticationPrincipal User user) {

        return ResponseEntity.status(201)
                .body(collectionService.createCollection(user, request));
    }

    @PostMapping("/{id}/albums")
    public ResponseEntity<CollectionResponse> addAlbum(
            @PathVariable UUID id,
            @RequestBody AddAlbumRequest request,
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(
                collectionService.addAlbum(user, id, request));
    }

    @DeleteMapping("/{id}/albums/{spotifyAlbumId}")
    public ResponseEntity<CollectionResponse> removeAlbum(
            @PathVariable UUID id,
            @PathVariable String spotifyAlbumId,
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(
                collectionService.removeAlbum(user, id, spotifyAlbumId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {

        collectionService.deleteCollection(user, id);
        return ResponseEntity.noContent().build();
    }
}