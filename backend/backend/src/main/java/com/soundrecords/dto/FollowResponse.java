package com.soundrecords.dto;

import lombok.*;

@Data
@Builder
public class FollowResponse {
    private Boolean following;
    private Integer followersCount;
}