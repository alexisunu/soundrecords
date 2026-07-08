package com.soundrecords.model;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "followers")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@IdClass(Follower.FollowerKey.class)
public class Follower {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "follower_id", nullable = false)
    private User follower;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "following_id", nullable = false)
    private User following;

    // Clave compuesta
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FollowerKey implements Serializable {
        private UUID follower;
        private UUID following;
    }
}