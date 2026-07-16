package com.soundrecords.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
public class BadgeStoreResponse {
    private Integer myPoints;
    private List<BadgeResponse> badges;
}


