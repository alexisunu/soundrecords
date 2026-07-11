package com.soundrecords.controller;

import com.soundrecords.dto.*;
import com.soundrecords.model.User;
import com.soundrecords.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(201).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserDto> me(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                AuthResponse.UserDto.builder()
                        .id(user.getId())
                        .username(user.getDisplayUsername())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .points(user.getPoints())
                        .level(user.getLevel())
                        .isPremium(user.getIsPremium())
                        .spotifyLinked(user.getSpotifyLinked())
                        .photoUrl(user.getPhotoUrl())
                        .build()
        );
    }
}