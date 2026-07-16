package com.soundrecords.dto;

import lombok.*;

@Data
@Builder
public class PlanResponse {
    private String code;
    private String name;
    private Double price;
}