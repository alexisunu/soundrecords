package com.soundrecords.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
public class UserResponse {
    private UUID id;
    private String username;
    private String bio;
    private String photoUrl;
    private String level;
    private Integer followersCount;
    private Integer followingCount;
    private Integer reviewsCount;
    private Boolean isFollowedByMe;
    private Double averageRating;
}