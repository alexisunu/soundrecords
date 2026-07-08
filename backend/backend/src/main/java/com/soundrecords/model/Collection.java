package com.soundrecords.model;

import io.hypersistence.utils.hibernate.type.array.ListArrayType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "collections")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Collection {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Type(ListArrayType.class)
    @Column(
        name = "spotify_album_ids",
        columnDefinition = "text[]"
    )
    @Builder.Default
    private List<String> spotifyAlbumIds = new ArrayList<>();
}