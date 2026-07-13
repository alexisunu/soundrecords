package com.soundrecords.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ReviewUpdateResponse {
    private UUID id;
    private Integer rating;
    private String content;
    private LocalDateTime updatedAt;
}
