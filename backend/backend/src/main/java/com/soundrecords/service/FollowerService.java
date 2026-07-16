package com.soundrecords.service;

import com.soundrecords.dto.FollowResponse;
import com.soundrecords.dto.MissionCompletedResponse;
import com.soundrecords.model.*;
import com.soundrecords.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FollowerService {

    private final FollowerRepository followerRepository;
    private final UserRepository userRepository;
    private final MissionService missionService;
    private final NotificationService notificationService;

    // ── SEGUIR ────────────────────────────────────────────────────────────────

    @Transactional
    public FollowResponse follow(User follower, UUID targetUserId) {

        // No puede seguirse a sí mismo
        if (follower.getId().equals(targetUserId)) {
            throw new IllegalArgumentException(
                    "No puedes seguirte a ti mismo");
        }

        // Verificar que el usuario objetivo existe
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() ->
                        new RuntimeException("Usuario no encontrado"));

        // Verificar que no lo siga ya
        if (followerRepository.existsByFollowerIdAndFollowingId(
                follower.getId(), targetUserId)) {
            throw new IllegalArgumentException(
                    "Ya sigues a este usuario");
        }

        // Crear la relación
        Follower follow = Follower.builder()
                .follower(follower)
                .following(targetUser)
                .build();

        followerRepository.save(follow);

        // Notificar al usuario seguido
        notificationService.create(
                targetUser,
                "NEW_FOLLOWER",
                follower.getDisplayUsername() + " comenzó a seguirte"
        );

        // Verificar misiones de seguimiento
        checkFollowMissions(follower);

        int followersCount = followerRepository
                .countByFollowingId(targetUserId);

        return FollowResponse.builder()
                .following(true)
                .followersCount(followersCount)
                .build();
    }

    // ── DEJAR DE SEGUIR ───────────────────────────────────────────────────────

    @Transactional
    public FollowResponse unfollow(User follower, UUID targetUserId) {

        Follower follow = followerRepository
                .findByFollowerIdAndFollowingId(
                        follower.getId(), targetUserId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "No sigues a este usuario"));

        followerRepository.delete(follow);

        int followersCount = followerRepository
                .countByFollowingId(targetUserId);

        return FollowResponse.builder()
                .following(false)
                .followersCount(followersCount)
                .build();
    }

    // ── VERIFICAR MISIONES DE SEGUIMIENTO ─────────────────────────────────────

    private void checkFollowMissions(User user) {

        int followingCount = followerRepository
                .countByFollowerId(user.getId());

        // Misión: Sigue a 10 usuarios
        if (followingCount >= 10) {
            missionService.checkAndCompleteMissions(
                    user, "FOLLOWING_10");
        }

        // Verificar si el usuario objetivo tiene seguidores por primera vez
        // (misión "Primer seguidor" — se verifica en el lado del seguido)
        // Se maneja desde NotificationService al crear la notificación
    }
}