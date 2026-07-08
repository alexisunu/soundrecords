package com.soundrecords.controller;

import com.soundrecords.dto.ReviewCreateResponse;
import com.soundrecords.dto.ReviewRequest;
import com.soundrecords.model.User;
import com.soundrecords.model.Review;
import com.soundrecords.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewCreateResponse> createReview(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ReviewRequest request
    ) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        try {
            Review saved = reviewService.createReview(user, request);

            ReviewCreateResponse resp = ReviewCreateResponse.builder()
                    .id(saved.getId())
                    .rating(saved.getRating())
                    .content(saved.getContent())
                    .createdAt(saved.getCreatedAt())
                    .likesCount(saved.getLikesCount())
                    .missionCompleted(null) // mission logic not implemented yet
                    .build();

            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        } catch (IllegalStateException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, ex.getMessage());
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create review");
        }
    }
}
