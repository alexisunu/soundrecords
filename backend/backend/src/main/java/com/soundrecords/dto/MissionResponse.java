package com.soundrecords.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
public class MissionResponse {

    private UUID id;
    private String name;
    private String description;
    private String missionType;
    private Integer rewardPoints;
    private Boolean completed;
    private String progress; // ej: "41/50" para logros
}