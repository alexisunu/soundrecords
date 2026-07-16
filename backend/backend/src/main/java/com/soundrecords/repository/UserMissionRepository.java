package com.soundrecords.repository;

import com.soundrecords.model.UserMission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface UserMissionRepository extends JpaRepository<UserMission, UUID> {

    // Misiones completadas por el usuario
    List<UserMission> findByUserId(UUID userId);

    // Verificar si ya completó una misión específica
    boolean existsByUserIdAndMissionId(UUID userId, UUID missionId);

    // Misiones diarias completadas hoy
    @Query("""
        SELECT um FROM UserMission um
        WHERE um.user.id = :userId
        AND um.mission.missionType = 'DAILY'
        AND um.completedAt >= :startOfDay
    """)
    List<UserMission> findDailyCompletedToday(UUID userId, LocalDateTime startOfDay);
}