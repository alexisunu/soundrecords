package com.soundrecords.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
public class MissionProgressResponse {

    private String level;
    private Integer points;
    private Integer pointsToNextLevel;
    private List<MissionResponse> dailyMissions;
    private List<MissionResponse> achievementMissions;
}