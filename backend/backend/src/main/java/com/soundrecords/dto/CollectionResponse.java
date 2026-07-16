package com.soundrecords.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class CollectionResponse {
    private UUID id;
    private String name;
    private String description;
    private List<String> spotifyAlbumIds;
    private Integer albumsCount;
}