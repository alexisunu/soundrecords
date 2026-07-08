package com.soundrecords.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
public class AlbumResponse {

    private String spotifyAlbumId;
    private String name;
    private String artist;
    private String coverUrl;
    private String releaseYear;
    private List<String> tracklist;

    // Estos campos los llena el backend con datos propios de la BD
    private Double platformRating;
    private Integer platformReviewsCount;
    private ReviewResponse myReview; // null si el usuario no ha reseñado
}