package com.soundrecords.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "missions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Mission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "mission_type", nullable = false)
    private String missionType; // "DAILY" o "ACHIEVEMENT"

    @Column(name = "reward_points", nullable = false)
    private Integer rewardPoints;
}