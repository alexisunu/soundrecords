package com.soundrecords.dto;

import lombok.*;

import java.util.UUID;

@Data
@Builder
public class AuthResponse {

    private String token;
    private UserDto user;

    @Data
    @Builder
    public static class UserDto {
        private UUID id;
        private String username;
        private String email;
        private String role;
        private Integer points;
        private String level;
        private Boolean isPremium;
        private Boolean spotifyLinked;
        private String photoUrl;
    }
}