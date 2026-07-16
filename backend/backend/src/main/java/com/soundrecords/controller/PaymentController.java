package com.soundrecords.controller;

import com.soundrecords.dto.PlanResponse;
import com.soundrecords.dto.SubscribeRequest;
import com.soundrecords.dto.SubscribeResponse;
import com.soundrecords.model.User;
import com.soundrecords.repository.UserRepository;
import com.soundrecords.service.ArtistService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    
    private final UserRepository userRepository;
    private final ArtistService artistService;

    @GetMapping("/plans")
    public ResponseEntity<Map<String, List<PlanResponse>>> getPlans() {

        List<PlanResponse> plans = List.of(
            PlanResponse.builder()
                .code("FREE")
                .name("Gratis")
                .price(0.0)
                .build(),
            PlanResponse.builder()
                .code("LISTENER_PREMIUM")
                .name("Oyente Premium")
                .price(3.99)
                .build(),
            PlanResponse.builder()
                .code("ARTIST_PREMIUM")
                .name("Artista Premium")
                .price(12.0)
                .build()
        );

        return ResponseEntity.ok(Map.of("plans", plans));
    }

    @PostMapping("/subscribe")
    public ResponseEntity<SubscribeResponse> subscribe(
            @RequestBody SubscribeRequest request,
            @AuthenticationPrincipal User user) {

        List<String> validPlans = List.of(
                "FREE", "LISTENER_PREMIUM", "ARTIST_PREMIUM");

        if (request.getPlanCode() == null ||
            !validPlans.contains(request.getPlanCode())) {
            throw new IllegalArgumentException("Plan no válido");
        }

        if (!request.getPlanCode().equals("FREE") &&
            (request.getCardToken() == null ||
            request.getCardToken().isBlank())) {
            throw new IllegalArgumentException(
                    "Pago rechazado — token de tarjeta inválido");
        }

        boolean isPremium = !request.getPlanCode().equals("FREE");
        user.setIsPremium(isPremium);
        userRepository.save(user);

        // Si compró plan artista → crear perfil automáticamente
        if (request.getPlanCode().equals("ARTIST_PREMIUM")) {
            artistService.createArtistIfNotExists(user);
        }

        return ResponseEntity.ok(SubscribeResponse.builder()
                .message("Suscripción activada")
                .isPremium(isPremium)
                .planCode(request.getPlanCode())
                .build());
    }
}