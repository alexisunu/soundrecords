package com.soundrecords.dto;

import lombok.*;

@Data
public class SubscribeRequest {
    private String planCode;
    private String paymentMethod;
    private String cardToken;
}