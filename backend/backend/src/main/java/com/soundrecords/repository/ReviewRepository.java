package com.soundrecords.repository;

import com.soundrecords.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    Integer countByUserId(UUID userId);

    // Para el detalle de álbum — rating promedio
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.spotifyAlbumId = :spotifyAlbumId")
    Double findAverageRatingBySpotifyAlbumId(String spotifyAlbumId);

    // Para el detalle de álbum — total de reseñas
    Integer countBySpotifyAlbumId(String spotifyAlbumId);

    // Para saber si el usuario ya reseñó este álbum
    Optional<Review> findByUserIdAndSpotifyAlbumId(UUID userId, String spotifyAlbumId);

    // Para listar reseñas de un álbum
    List<Review> findBySpotifyAlbumIdOrderByCreatedAtDesc(String spotifyAlbumId);

    // Para el feed — reseñas de usuarios seguidos
    @Query("""
        SELECT r FROM Review r
        WHERE r.user.id IN (
            SELECT f.following.id FROM Follower f WHERE f.follower.id = :userId
        )
        ORDER BY r.createdAt DESC
    """)
    List<Review> findFeedByUserId(UUID userId);

    List<Review> findByUserIdOrderByCreatedAtDesc(UUID userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.user.id = :userId")
    Double findAverageRatingByUserId(UUID userId);

    List<Review> findAllByOrderByCreatedAtDesc();
}