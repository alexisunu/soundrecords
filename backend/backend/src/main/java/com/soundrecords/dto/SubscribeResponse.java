package com.soundrecords.dto;

import lombok.*;

@Data
@Builder
public class SubscribeResponse {
    private String message;
    private Boolean isPremium;
    private String planCode;
}