package com.soundrecords.dto;

import lombok.*;

@Data
public class ArtistRequest {
    private String artistName;
    private String biography;
    private String genres;
    private String spotifyUrl;
    private String photoUrl;
}