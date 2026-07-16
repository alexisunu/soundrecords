package com.soundrecords.service;

import com.soundrecords.dto.*;
import com.soundrecords.model.*;
import com.soundrecords.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MissionService {

    private final MissionRepository missionRepository;
    private final UserMissionRepository userMissionRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;

    // ── NIVELES ───────────────────────────────────────────────────────────────

    private static final int POINTS_CRITICO    = 200;
    private static final int POINTS_EXPERTO    = 500;
    private static final int POINTS_LEGENDARIO = 1000;

    private String calculateLevel(int points) {
        if (points >= POINTS_LEGENDARIO) return "Legendario";
        if (points >= POINTS_EXPERTO)    return "Experto";
        if (points >= POINTS_CRITICO)    return "Crítico";
        return "Oyente";
    }

    private int pointsToNextLevel(int points) {
        if (points >= POINTS_LEGENDARIO) return 0;
        if (points >= POINTS_EXPERTO)    return POINTS_LEGENDARIO - points;
        if (points >= POINTS_CRITICO)    return POINTS_EXPERTO - points;
        return POINTS_CRITICO - points;
    }

    // ── VER MISIONES Y PROGRESO ───────────────────────────────────────────────

    public MissionProgressResponse getProgress(User user) {

        List<UserMission> completedMissions =
                userMissionRepository.findByUserId(user.getId());

        List<UUID> completedIds = completedMissions.stream()
                .map(um -> um.getMission().getId())
                .toList();

        // Misiones diarias
        List<Mission> dailyMissions =
                missionRepository.findByMissionType("DAILY");

        // Para diarias — verificar si ya las completó HOY
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        List<UserMission> completedToday =
                userMissionRepository.findDailyCompletedToday(
                        user.getId(), startOfDay);

        List<UUID> completedTodayIds = completedToday.stream()
                .map(um -> um.getMission().getId())
                .toList();

        List<MissionResponse> dailyResponses = dailyMissions.stream()
                .map(m -> MissionResponse.builder()
                        .id(m.getId())
                        .name(m.getName())
                        .description(m.getDescription())
                        .missionType(m.getMissionType())
                        .rewardPoints(m.getRewardPoints())
                        .completed(completedTodayIds.contains(m.getId()))
                        .build())
                .toList();

        // Misiones de logro
        List<Mission> achievementMissions =
                missionRepository.findByMissionType("ACHIEVEMENT");

        int totalReviews = reviewRepository.countByUserId(user.getId());

        List<MissionResponse> achievementResponses = achievementMissions.stream()
                .map(m -> {
                    boolean completed = completedIds.contains(m.getId());
                    String progress = buildProgress(m.getName(), totalReviews);
                    return MissionResponse.builder()
                            .id(m.getId())
                            .name(m.getName())
                            .description(m.getDescription())
                            .missionType(m.getMissionType())
                            .rewardPoints(m.getRewardPoints())
                            .completed(completed)
                            .progress(progress)
                            .build();
                })
                .toList();

        return MissionProgressResponse.builder()
                .level(user.getLevel())
                .points(user.getPoints())
                .pointsToNextLevel(pointsToNextLevel(user.getPoints()))
                .dailyMissions(dailyResponses)
                .achievementMissions(achievementResponses)
                .build();
    }

    // ── VERIFICAR Y COMPLETAR MISIONES AUTOMÁTICAMENTE ───────────────────────

    @Transactional
    public List<MissionCompletedResponse> checkAndCompleteMissions(User user, String actionType) {
        List<MissionCompletedResponse> completed = new ArrayList<>();

        // ==========================================
        // 1. MISIONES DIARIAS
        // ==========================================
        List<Mission> dailyMissions = missionRepository.findByMissionType("DAILY");
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        List<UserMission> completedToday = userMissionRepository.findDailyCompletedToday(user.getId(), startOfDay);
        
        List<UUID> completedTodayIds = completedToday.stream()
                .map(um -> um.getMission().getId())
                .toList();

        for (Mission mission : dailyMissions) {
            if (completedTodayIds.contains(mission.getId())) continue;

            if (missionApplies(mission, actionType, user)) {
                completeMission(user, mission);
                completed.add(MissionCompletedResponse.builder()
                        .name(mission.getName())
                        .pointsEarned(mission.getRewardPoints())
                        .build());
            }
        }

        // ==========================================
        // 2. LOGROS (ACHIEVEMENTS)
        // ==========================================
        List<Mission> achievements = missionRepository.findByMissionType("ACHIEVEMENT");
        List<UserMission> allCompleted = userMissionRepository.findByUserId(user.getId());
        
        List<UUID> allCompletedIds = allCompleted.stream()
                .map(um -> um.getMission().getId())
                .toList();

        int totalReviews = reviewRepository.countByUserId(user.getId());

        for (Mission mission : achievements) {
            if (allCompletedIds.contains(mission.getId())) continue;

            // AQUÍ ESTÁ LA MAGIA: 
            // Verificamos SI cumple la condición histórica (ej. tener 10 reseñas) 
            // O SI aplica por la acción actual (ej. seguir a 10 personas en este clic)
            if (achievementUnlocked(mission, user, totalReviews) || missionApplies(mission, actionType, user)) {
                completeMission(user, mission);
                completed.add(MissionCompletedResponse.builder()
                        .name(mission.getName())
                        .pointsEarned(mission.getRewardPoints())
                        .build());
            }
        }

        return completed;
    }

    // ── LÓGICA DE MISIONES ────────────────────────────────────────────────────

    private boolean missionApplies(Mission mission, String actionType, User user) {
    // Protección en caso de que la misión no tenga key
    if (mission.getMissionKey() == null) return false;
    
    return switch (mission.getMissionKey()) {
        // Misiones Diarias Implementadas
        case "DAILY_REVIEW_ALBUM" -> actionType.equals("REVIEW_CREATED");
        case "DAILY_REVIEW_EMERGENT" -> actionType.equals("REVIEW_EMERGENT_ARTIST");
        
        // Las de "likes" y "género" se borraron de aquí. Al no estar, caen en el default -> false.

        // Logros que dependen de una ACCIÓN directa (como seguir a alguien)
        case "ACHIEVEMENT_FOLLOW_10" -> actionType.equals("FOLLOWING_10");
        case "ACHIEVEMENT_FIRST_FOLLOWER" -> actionType.equals("FOLLOWER_GAINED"); 
        
        default -> false;
    };
}

    private boolean achievementUnlocked(Mission mission, User user, int totalReviews) {
        return switch (mission.getName()) {
            case "Primera reseña"      -> totalReviews >= 1;
            case "10 reseñas escritas" -> totalReviews >= 10;
            case "50 reseñas escritas" -> totalReviews >= 50;
            case "Primer seguidor"     -> false; // se verifica en FollowerService
            case "Sigue a 10 usuarios" -> false; // se verifica en FollowerService
            case "Coleccionista"       -> false; // se verifica en CollectionService
            default -> false;
        };
    }

    // ── COMPLETAR MISIÓN Y SUMAR PUNTOS ──────────────────────────────────────

    @Transactional
    public void completeMission(User user, Mission mission) {

        // ← Agregar esta verificación
        if (userMissionRepository.existsByUserIdAndMissionId(
                user.getId(), mission.getId())) {
            log.info("Misión ya completada anteriormente: {}", mission.getName());
            return; // No hacer nada si ya la completó
        }

        // Registrar la misión completada
        UserMission userMission = UserMission.builder()
                .user(user)
                .mission(mission)
                .build();
        userMissionRepository.save(userMission);

        // Sumar puntos al usuario
        int newPoints = user.getPoints() + mission.getRewardPoints();
        String newLevel = calculateLevel(newPoints);

        user.setPoints(newPoints);
        user.setLevel(newLevel);
        userRepository.save(user);

        log.info("Misión completada: {} — Usuario: {} — Puntos: +{}",
                mission.getName(), user.getUsername(),
                mission.getRewardPoints());
    }

    // ── PROGRESO DE LOGROS ────────────────────────────────────────────────────

    private String buildProgress(String missionName, int totalReviews) {
        return switch (missionName) {
            case "Primera reseña"      -> totalReviews + "/1";
            case "10 reseñas escritas" -> totalReviews + "/10";
            case "50 reseñas escritas" -> totalReviews + "/50";
            default -> null;
        };
    }
    // ── VER TIENDA DE INSIGNIAS ───────────────────────────────────────────────

public BadgeStoreResponse getBadgeStore(User user) {

    List<Badge> allBadges = badgeRepository.findAll();

    List<UUID> ownedBadgeIds = userBadgeRepository
            .findByUserId(user.getId())
            .stream()
            .map(ub -> ub.getBadge().getId())
            .toList();

    List<BadgeResponse> badges = allBadges.stream()
            .map(badge -> BadgeResponse.builder()
                    .id(badge.getId())
                    .name(badge.getName())
                    .description(badge.getDescription())
                    .imageUrl(badge.getImageUrl())
                    .costPoints(badge.getCostPoints())
                    .owned(ownedBadgeIds.contains(badge.getId()))
                    .build())
            .toList();

    return BadgeStoreResponse.builder()
            .myPoints(user.getPoints())
            .badges(badges)
            .build();
}

    // ── COMPRAR INSIGNIA ──────────────────────────────────────────────────────

    @Transactional
    public BadgePurchaseResponse purchaseBadge(User user, UUID badgeId) {

        Badge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() ->
                        new RuntimeException("Insignia no encontrada"));

        // Verificar si ya la tiene
        if (userBadgeRepository.existsByUserIdAndBadgeId(
                user.getId(), badgeId)) {
            throw new IllegalArgumentException("Ya tienes esta insignia");
        }

        // Verificar puntos suficientes
        if (user.getPoints() < badge.getCostPoints()) {
            throw new IllegalArgumentException(
                    "Puntos insuficientes. Necesitas " +
                    badge.getCostPoints() + " puntos");
        }

        // Descontar puntos
        user.setPoints(user.getPoints() - badge.getCostPoints());
        userRepository.save(user);

        // Asociar insignia al usuario
        UserBadge userBadge = UserBadge.builder()
                .user(user)
                .badge(badge)
                .build();
        userBadgeRepository.save(userBadge);

        return BadgePurchaseResponse.builder()
                .message("Insignia obtenida")
                .remainingPoints(user.getPoints())
                .build();
    }

    public List<BadgeResponse> getMyBadges(User user) {

    return userBadgeRepository.findByUserId(user.getId())
            .stream()
            .map(ub -> BadgeResponse.builder()
                    .id(ub.getBadge().getId())
                    .name(ub.getBadge().getName())
                    .description(ub.getBadge().getDescription())
                    .imageUrl(ub.getBadge().getImageUrl())
                    .costPoints(ub.getBadge().getCostPoints())
                    .owned(true)
                    .build())
            .toList();
}
}