package com.soundrecords.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_badges")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UserBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "badge_id", nullable = false)
    private Badge badge;

    @Column(name = "obtained_at", nullable = false, updatable = false)
    private LocalDateTime obtainedAt;

    @PrePersist
    protected void onCreate() {
        this.obtainedAt = LocalDateTime.now();
    }
}