package com.soundrecords.service;

import com.soundrecords.dto.*;
import com.soundrecords.model.*;
import com.soundrecords.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CollectionService {

    private final CollectionRepository collectionRepository;
    private final MissionService missionService;

    // ── VER MIS COLECCIONES ───────────────────────────────────────────────────

    public List<CollectionResponse> getMyCollections(User user) {
        return collectionRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── CREAR COLECCIÓN ───────────────────────────────────────────────────────

    @Transactional
    public CollectionResponse createCollection(
            User user, CollectionRequest request) {

        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException(
                    "El nombre de la colección es obligatorio");
        }

        Collection collection = Collection.builder()
                .user(user)
                .name(request.getName())
                .description(request.getDescription())
                .spotifyAlbumIds("")
                .build();

        collectionRepository.save(collection);

        // Verificar misión "Coleccionista"
        missionService.checkAndCompleteMissions(
                user, "COLLECTION_CREATED");

        return mapToResponse(collection);
    }

    // ── AGREGAR ÁLBUM A COLECCIÓN ─────────────────────────────────────────────

    @Transactional
    public CollectionResponse addAlbum(
            User user, UUID collectionId, AddAlbumRequest request) {

        Collection collection = getCollectionAndVerifyOwner(
                user, collectionId);

        if (request.getSpotifyAlbumId() == null ||
            request.getSpotifyAlbumId().isBlank()) {
            throw new IllegalArgumentException(
                    "El ID del álbum es obligatorio");
        }

        List<String> albums = collection.getSpotifyAlbumIdsList();

        if (albums.contains(request.getSpotifyAlbumId())) {
            throw new IllegalArgumentException(
                    "Este álbum ya está en la colección");
        }

        collection.addAlbumId(request.getSpotifyAlbumId());
        collectionRepository.save(collection);

        return mapToResponse(collection);
    }

    // ── QUITAR ÁLBUM DE COLECCIÓN ─────────────────────────────────────────────

    @Transactional
    public CollectionResponse removeAlbum(
            User user, UUID collectionId, String spotifyAlbumId) {

        Collection collection = getCollectionAndVerifyOwner(
                user, collectionId);

        List<String> albums = collection.getSpotifyAlbumIdsList();

        if (!albums.contains(spotifyAlbumId)) {
            throw new IllegalArgumentException(
                    "Este álbum no está en la colección");
        }

        collection.removeAlbumId(spotifyAlbumId);
        collectionRepository.save(collection);

        return mapToResponse(collection);
    }

    // ── ELIMINAR COLECCIÓN ────────────────────────────────────────────────────

    @Transactional
    public void deleteCollection(User user, UUID collectionId) {

        Collection collection = getCollectionAndVerifyOwner(
                user, collectionId);

        collectionRepository.delete(collection);
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────

    private Collection getCollectionAndVerifyOwner(
            User user, UUID collectionId) {

        Collection collection = collectionRepository
                .findById(collectionId)
                .orElseThrow(() ->
                        new RuntimeException("Colección no encontrada"));

        if (!collection.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "No tienes permiso para modificar esta colección");
        }

        return collection;
    }

    private CollectionResponse mapToResponse(Collection collection) {
        List<String> albums = collection.getSpotifyAlbumIdsList();
        return CollectionResponse.builder()
                .id(collection.getId())
                .name(collection.getName())
                .description(collection.getDescription())
                .spotifyAlbumIds(albums)
                .albumsCount(albums.size())
                .build();
    }
}