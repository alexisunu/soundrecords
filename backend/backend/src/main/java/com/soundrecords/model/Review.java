package com.soundrecords.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reviews")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "spotify_album_id", nullable = false)
    private String spotifyAlbumId;

    @Column(name = "album_name", nullable = false)
    private String albumName;

    @Column(name = "artist_name", nullable = false)
    private String artistName;

    @Column(name = "cover_url", columnDefinition = "TEXT")
    private String coverUrl;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private Integer rating;

    @Column(name = "likes_count", nullable = false)
    @Builder.Default
    private Integer likesCount = 0;

    // ✅ Reemplaza reported + reportReason
    @Column(nullable = false)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, REMOVED, FLAGGED

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
