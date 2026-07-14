package com.soundrecords.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ReviewFeedItem {

    private UUID id;
    private ReviewFeedUser user;
    private String albumName;
    private String artistName;
    private String coverUrl;
    private Integer rating;
    private String content;
    private Integer likesCount;
    private Boolean likedByMe;
    private LocalDateTime createdAt;
}
