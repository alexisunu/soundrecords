package com.soundrecords.service;

import com.soundrecords.dto.ReviewRequest;
import com.soundrecords.dto.AlbumResponse;
import com.soundrecords.dto.AlbumReviewsResponse;
import com.soundrecords.dto.ReviewFeedItem;
import com.soundrecords.dto.ReviewFeedUser;
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

    public AlbumReviewsResponse getAlbumReviews(String spotifyAlbumId, User currentUser) {
        if (spotifyAlbumId == null || spotifyAlbumId.isBlank()) {
            throw new IllegalArgumentException("spotifyAlbumId es obligatorio");
        }

        String normalizedId = spotifyAlbumId.trim();
        java.util.List<Review> reviews = reviewRepository.findBySpotifyAlbumIdOrderByCreatedAtDesc(normalizedId);
        Double averageRating = reviewRepository.findAverageRatingBySpotifyAlbumId(normalizedId);
        Integer totalReviews = reviewRepository.countBySpotifyAlbumId(normalizedId);

        // myReview: si hay usuario autenticado, buscar su reseña
        com.soundrecords.dto.ReviewResponse myReview = null;
        if (currentUser != null) {
            java.util.Optional<Review> maybe = reviewRepository.findByUserIdAndSpotifyAlbumId(currentUser.getId(), normalizedId);
            if (maybe.isPresent()) {
                Review r = maybe.get();
                myReview = com.soundrecords.dto.ReviewResponse.builder()
                        .id(r.getId())
                        .userId(r.getUser().getId())
                        .username(r.getUser().getDisplayUsername())
                        .userPhotoUrl(r.getUser().getPhotoUrl())
                        .spotifyAlbumId(r.getSpotifyAlbumId())
                        .albumName(r.getAlbumName())
                        .artistName(r.getArtistName())
                        .coverUrl(r.getCoverUrl())
                        .content(r.getContent())
                        .rating(r.getRating())
                        .likesCount(r.getLikesCount())
                        .status(r.getStatus())
                        .createdAt(r.getCreatedAt())
                        .build();
            }
        }

        return AlbumReviewsResponse.builder()
                .reviews(reviews.stream()
                        .map(review -> mapToFeedItem(review, currentUser))
                        .toList())
                .averageRating(averageRating) // nullable: null significa "sin reseñas"
                .totalReviews(totalReviews == null ? 0 : totalReviews)
                .myReview(myReview)
                .build();
    }

    private ReviewFeedItem mapToFeedItem(Review review, User currentUser) {
        return ReviewFeedItem.builder()
                .id(review.getId())
                .user(ReviewFeedUser.builder()
                        .id(review.getUser().getId())
                        .username(review.getUser().getDisplayUsername())
                        .photoUrl(review.getUser().getPhotoUrl())
                        .build())
                .albumName(review.getAlbumName())
                .artistName(review.getArtistName())
                .coverUrl(review.getCoverUrl())
                .rating(review.getRating())
                .content(review.getContent())
                .likesCount(review.getLikesCount())
                .likedByMe(false)
                .createdAt(review.getCreatedAt())
                .build();
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
