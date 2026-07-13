package com.soundrecords.service;

import com.soundrecords.dto.ReviewRequest;
import com.soundrecords.dto.AlbumResponse;
import com.soundrecords.model.Review;
import com.soundrecords.model.User;
import com.soundrecords.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;


@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final SpotifyService spotifyService;

    /**
     * Crea una reseña, validaciones básicas se realizan en el controlador/DTO.
     */
    @Transactional
    public Review createReview(User user, ReviewRequest request) {
        // verificar si ya existe reseña del usuario para este álbum
        Optional<Review> existing = reviewRepository.findByUserIdAndSpotifyAlbumId(user.getId(), request.getSpotifyAlbumId());
        if (existing.isPresent()) {
            throw new IllegalStateException("User already has a review for this album");
        }

        // Si no se envió metadata del álbum, obtenerla desde Spotify
        AlbumResponse album = null;
        if (request.getAlbumName() == null || request.getAlbumName().isBlank()) {
            try {
                album = spotifyService.getAlbumById(request.getSpotifyAlbumId());
            } catch (Exception ex) {
                throw new IllegalArgumentException("Album not found on Spotify: " + ex.getMessage());
            }
        }

        String albumName = request.getAlbumName();
        String artistName = request.getArtistName();
        String coverUrl = request.getCoverUrl();
        if (album != null) {
            if (albumName == null || albumName.isBlank()) albumName = album.getName();
            if (artistName == null || artistName.isBlank()) artistName = album.getArtist();
            if (coverUrl == null || coverUrl.isBlank()) coverUrl = album.getCoverUrl();
        }

        Review r = Review.builder()
                .user(user)
                .spotifyAlbumId(request.getSpotifyAlbumId())
                .albumName(albumName)
                .artistName(artistName)
                .coverUrl(coverUrl)
                .content(request.getContent())
                .rating(request.getRating())
                .build();

        Review saved = reviewRepository.save(r);

        reviewRepository.findAverageRatingBySpotifyAlbumId(request.getSpotifyAlbumId());

        return saved;
    }

    @Transactional
    public Review updateReview(org.springframework.security.core.userdetails.UserDetails principal, java.util.UUID reviewId, com.soundrecords.dto.ReviewUpdateRequest request, com.soundrecords.model.User user) {
        // NOTE: keeping signature to accept principal but use user for ownership checks
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Not the owner of the review");
        }

        review.setRating(request.getRating());
        review.setContent(request.getContent());
        Review saved = reviewRepository.save(review);

        // recalcular promedio
        reviewRepository.findAverageRatingBySpotifyAlbumId(review.getSpotifyAlbumId());

        return saved;
    }

    @Transactional
    public void deleteReview(com.soundrecords.model.User user, java.util.UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Not the owner of the review");
        }

        reviewRepository.delete(review);

        // recalcular promedio
        reviewRepository.findAverageRatingBySpotifyAlbumId(review.getSpotifyAlbumId());
    }
}
