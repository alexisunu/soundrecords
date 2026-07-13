package com.soundrecords.service;

import com.soundrecords.dto.UpdateCredentialsResponse;
import com.soundrecords.dto.UserCredentialsUpdateRequest;
import com.soundrecords.dto.UserProfileUpdateRequest;
import com.soundrecords.dto.UserResponse;
import com.soundrecords.model.User;
import com.soundrecords.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse updateProfile(User user, UserProfileUpdateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Datos de perfil inválidos");
        }

        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new IllegalArgumentException("El nombre de usuario es obligatorio");
        }

        String username = request.getUsername().trim();

        User persistedUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (!username.equals(persistedUser.getDisplayUsername()) && userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("El nombre de usuario ya está en uso");
        }

        persistedUser.setUsername(username);
        persistedUser.setBio(trimToNull(request.getBio()));
        persistedUser.setPhotoUrl(trimToNull(request.getPhotoUrl()));

        User updatedUser = userRepository.save(persistedUser);
        return mapToUserResponse(updatedUser);
    }

    public UpdateCredentialsResponse updateCredentials(User user, UserCredentialsUpdateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Datos de credenciales inválidos");
        }

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("El email es obligatorio");
        }

        String email = request.getEmail().trim();

        User persistedUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (!email.equals(persistedUser.getEmail()) && userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("El email ya está en uso");
        }

        persistedUser.setEmail(email);

        if (request.getNewPassword() != null) {
            if (request.getNewPassword().isBlank()) {
                throw new IllegalArgumentException("La nueva contraseña no puede estar vacía");
            }
            if (request.getNewPassword().length() < 8) {
                throw new IllegalArgumentException("La nueva contraseña debe tener mínimo 8 caracteres");
            }
            persistedUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        userRepository.save(persistedUser);
        return new UpdateCredentialsResponse("Credenciales actualizadas correctamente");
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getDisplayUsername())
                .bio(user.getBio())
                .photoUrl(user.getPhotoUrl())
                .build();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
