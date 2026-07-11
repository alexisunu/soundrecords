package com.soundrecords.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "artists")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Artist {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "artist_name", nullable = false)
    private String artistName;

    @Column(columnDefinition = "TEXT")
    private String biography;

    @Column(columnDefinition = "TEXT")
    private String genres;

    @Column(name = "spotify_url", columnDefinition = "TEXT")
    private String spotifyUrl;

    @Column(name = "is_premium", nullable = false)
    @Builder.Default
    private Boolean isPremium = false;

    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;

    @Column(name = "profile_views", nullable = false)
    @Builder.Default
    private Integer profileViews = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
