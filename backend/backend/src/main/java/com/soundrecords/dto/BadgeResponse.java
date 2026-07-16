package com.soundrecords.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
public class BadgeResponse {
    private UUID id;
    private String name;
    private String description;
    private String imageUrl;
    private Integer costPoints;
    private Boolean owned;
}