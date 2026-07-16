package com.soundrecords.repository;

import com.soundrecords.model.Follower;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FollowerRepository extends JpaRepository<Follower, UUID> {

    // Verificar si ya sigue a alguien
    boolean existsByFollowerIdAndFollowingId(UUID followerId, UUID followingId);

    // Encontrar la relación para poder eliminarla
    Optional<Follower> findByFollowerIdAndFollowingId(UUID followerId, UUID followingId);

    // Contar seguidores de un usuario
    int countByFollowingId(UUID followingId);

    // Contar a cuántos sigue un usuario
    int countByFollowerId(UUID followerId);

    // IDs de usuarios que sigue (para el feed)
    @Query("SELECT f.following.id FROM Follower f WHERE f.follower.id = :userId")
    List<UUID> findFollowingIdsByFollowerId(UUID userId);
}