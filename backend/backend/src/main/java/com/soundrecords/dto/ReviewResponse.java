package com.soundrecords.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ReviewResponse {

    private UUID id;
    private UUID userId;
    private String username;
    private String userPhotoUrl;
    private String spotifyAlbumId;
    private String albumName;
    private String artistName;
    private String coverUrl;
    private String content;
    private Integer rating;
    private Integer likesCount;
    private String status;
    private LocalDateTime createdAt;
}
