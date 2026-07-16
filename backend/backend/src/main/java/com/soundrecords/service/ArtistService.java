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
public class ArtistService {

    private final ArtistRepository artistRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    // ── CREAR PERFIL DE ARTISTA ───────────────────────────────────────────────

    @Transactional
    public ArtistResponse createArtist(User user, ArtistRequest request) {

        if (artistRepository.existsByUserId(user.getId())) {
            throw new IllegalArgumentException(
                    "Ya tienes un perfil de artista");
        }

        if (request.getArtistName() == null ||
            request.getArtistName().isBlank()) {
            throw new IllegalArgumentException(
                    "El nombre del artista es obligatorio");
        }

        Artist artist = Artist.builder()
                .user(user)
                .artistName(request.getArtistName())
                .biography(request.getBiography())
                .genres(request.getGenres())
                .spotifyUrl(request.getSpotifyUrl())
                .photoUrl(request.getPhotoUrl())
                .build();

        artistRepository.save(artist);

        // Cambiar role del usuario a ARTIST
        user.setRole("ARTIST");
        userRepository.save(user);

        return mapToResponse(artist);
    }

    // ── DESCUBRIR ARTISTAS EMERGENTES ─────────────────────────────────────────

    public List<ArtistResponse> discoverArtists() {
        return artistRepository
                .findAllByOrderByIsPremiumDescProfileViewsDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── VER PERFIL PÚBLICO DE ARTISTA ─────────────────────────────────────────

    @Transactional
    public ArtistResponse getPublicProfile(UUID artistId) {

        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() ->
                        new RuntimeException("Artista no encontrado"));

        // Incrementar profileViews
        artist.setProfileViews(artist.getProfileViews() + 1);
        artistRepository.save(artist);

        return mapToResponse(artist);
    }

    // ── DASHBOARD PRIVADO ─────────────────────────────────────────────────────

    public ArtistDashboardResponse getDashboard(User user) {

        Artist artist = artistRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("No tienes perfil de artista"));

        Double avgRating = reviewRepository
                .findAverageRatingByUserId(user.getId());

        Integer totalReviews = reviewRepository
                .countByUserId(user.getId());

        return ArtistDashboardResponse.builder()
                .profileViews(artist.getProfileViews())
                .averageRating(avgRating != null ? avgRating : 0.0)
                .totalReviews(totalReviews != null ? totalReviews : 0)
                .isPremium(artist.getIsPremium())
                .build();
    }

    // ── EDITAR PERFIL ─────────────────────────────────────────────────────────

    @Transactional
    public ArtistResponse updateArtist(User user, ArtistRequest request) {

        Artist artist = artistRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("No tienes perfil de artista"));

        if (request.getArtistName() != null &&
            !request.getArtistName().isBlank()) {
            artist.setArtistName(request.getArtistName());
        }
        if (request.getBiography() != null) {
            artist.setBiography(request.getBiography());
        }
        if (request.getGenres() != null) {
            artist.setGenres(request.getGenres());
        }
        if (request.getSpotifyUrl() != null) {
            artist.setSpotifyUrl(request.getSpotifyUrl());
        }
        if (request.getPhotoUrl() != null) {
            artist.setPhotoUrl(request.getPhotoUrl());
        }

        artistRepository.save(artist);
        return mapToResponse(artist);
    }

    // ── ACTIVAR BOOST ─────────────────────────────────────────────────────────

    @Transactional
    public ArtistResponse toggleBoost(User user, Boolean active) {

        if (!user.getIsPremium()) {
            throw new IllegalArgumentException(
                    "Necesitas plan Artista Premium para activar el boost");
        }

        Artist artist = artistRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("No tienes perfil de artista"));

        artist.setIsPremium(active);
        artistRepository.save(artist);

        return mapToResponse(artist);
    }

    // ── MAPPER ────────────────────────────────────────────────────────────────

    private ArtistResponse mapToResponse(Artist artist) {
        return ArtistResponse.builder()
                .id(artist.getId())
                .userId(artist.getUser().getId())
                .artistName(artist.getArtistName())
                .biography(artist.getBiography())
                .genres(artist.getGenres())
                .spotifyUrl(artist.getSpotifyUrl())
                .photoUrl(artist.getPhotoUrl())
                .isPremium(artist.getIsPremium())
                .profileViews(artist.getProfileViews())
                .build();
    }


    @Transactional
    public void createArtistIfNotExists(User user) {

        // Si ya tiene perfil solo activar is_premium
        if (artistRepository.existsByUserId(user.getId())) {
            Artist artist = artistRepository.findByUserId(user.getId())
                    .orElseThrow();
            artist.setIsPremium(true);
            artistRepository.save(artist);
            return;
        }

        // Crear perfil básico automáticamente
        Artist artist = Artist.builder()
                .user(user)
                .artistName(user.getDisplayUsername())
                .isPremium(true)
                .build();

        artistRepository.save(artist);

        // Cambiar role a ARTIST
        user.setRole("ARTIST");
        userRepository.save(user);
    }
}