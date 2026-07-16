package com.soundrecords.dto;

import lombok.*;

@Data
@Builder
public class BadgePurchaseResponse {
    private String message;
    private Integer remainingPoints;
}