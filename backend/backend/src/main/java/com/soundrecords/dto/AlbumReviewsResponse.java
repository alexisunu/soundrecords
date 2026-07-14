package com.soundrecords.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AlbumReviewsResponse {

    private List<ReviewFeedItem> reviews;
    private Double averageRating;
    private Integer totalReviews;
    private ReviewResponse myReview; // null si no autenticado o si el usuario no ha reseñado
}
