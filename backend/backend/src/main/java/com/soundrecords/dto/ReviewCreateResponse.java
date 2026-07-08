package com.soundrecords.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ReviewCreateResponse {
    private UUID id;
    private Integer rating;
    private String content;
    private LocalDateTime createdAt;
    private Integer likesCount;
    private MissionCompleted missionCompleted;

    @Data
    @Builder
    public static class MissionCompleted {
        private String name;
        private Integer pointsEarned;
    }
}
