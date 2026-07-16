package com.soundrecords.dto;

import lombok.*;

@Data
@Builder
public class ArtistDashboardResponse {
    private Integer profileViews;
    private Double averageRating;
    private Integer totalReviews;
    private Boolean isPremium;
}