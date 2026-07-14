package com.soundrecords.controller;

import com.soundrecords.dto.UpdateCredentialsResponse;
import com.soundrecords.dto.UserCredentialsUpdateRequest;
import com.soundrecords.dto.UserProfileUpdateRequest;
import com.soundrecords.dto.UserResponse;
import com.soundrecords.model.User;
import com.soundrecords.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody UserProfileUpdateRequest request
    ) {
        return ResponseEntity.ok(userService.updateProfile(user, request));
    }

    @PatchMapping("/me/credentials")
    public ResponseEntity<UpdateCredentialsResponse> updateCredentials(
            @AuthenticationPrincipal User user,
            @RequestBody UserCredentialsUpdateRequest request
    ) {
        return ResponseEntity.ok(userService.updateCredentials(user, request));
    }
}
