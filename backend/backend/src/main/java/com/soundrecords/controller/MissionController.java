package com.soundrecords.controller;

import com.soundrecords.dto.BadgePurchaseResponse;
import com.soundrecords.dto.BadgeResponse;
import com.soundrecords.dto.BadgeStoreResponse;
import com.soundrecords.dto.MissionProgressResponse;
import com.soundrecords.model.User;
import com.soundrecords.service.MissionService;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/missions")
@RequiredArgsConstructor
public class MissionController {

    private final MissionService missionService;

    @GetMapping("/me")
    public ResponseEntity<MissionProgressResponse> getMyMissions(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(missionService.getProgress(user));
    }

    @GetMapping("/badges/store")
    public ResponseEntity<BadgeStoreResponse> getBadgeStore(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(missionService.getBadgeStore(user));
    }

    @PostMapping("/badges/{badgeId}/purchase")
    public ResponseEntity<BadgePurchaseResponse> purchaseBadge(
            @PathVariable UUID badgeId,
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(
                missionService.purchaseBadge(user, badgeId));
    }
    @GetMapping("/badges/me")
    public ResponseEntity<List<BadgeResponse>> getMyBadges(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(missionService.getMyBadges(user));
    }
}