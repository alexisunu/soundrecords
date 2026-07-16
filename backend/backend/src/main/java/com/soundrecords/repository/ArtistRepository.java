package com.soundrecords.repository;

import com.soundrecords.model.Artist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ArtistRepository extends JpaRepository<Artist, UUID> {

    Optional<Artist> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    // Artistas premium primero, luego por profileViews
    List<Artist> findAllByOrderByIsPremiumDescProfileViewsDesc();
}