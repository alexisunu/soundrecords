package com.soundrecords.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReviewRequest {

    @NotBlank
    private String spotifyAlbumId;

    // metadata opcional: si no viene, el backend la obtendrá de Spotify
    private String albumName;

    private String artistName;

    private String coverUrl;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    @NotBlank
    @Size(min = 50, max = 2000)
    private String content;
}
