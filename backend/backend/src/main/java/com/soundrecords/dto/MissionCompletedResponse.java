package com.soundrecords.dto;

import lombok.*;

@Data
@Builder
public class MissionCompletedResponse {

    private String name;
    private Integer pointsEarned;
    private String newLevel; // null si no subió de nivel
}