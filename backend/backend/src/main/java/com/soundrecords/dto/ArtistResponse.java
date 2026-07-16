package com.soundrecords.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
public class ArtistResponse {
    private UUID id;
    private UUID userId;
    private String artistName;
    private String biography;
    private String genres;
    private String spotifyUrl;
    private String photoUrl;
    private Boolean isPremium;
    private Integer profileViews;
}