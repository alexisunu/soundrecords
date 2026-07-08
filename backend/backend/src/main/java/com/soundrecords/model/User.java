package com.soundrecords.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;

    @Column(nullable = false)
    @Builder.Default
    private Integer points = 0;

    @Column(nullable = false)
    @Builder.Default
    private String level = "Oyente";

    @Column(nullable = false)
    @Builder.Default
    private String role = "LISTENER";

    @Column(name = "is_premium", nullable = false)
    @Builder.Default
    private Boolean isPremium = false;

    @Column(name = "spotify_linked", nullable = false)
    @Builder.Default
    private Boolean spotifyLinked = false;

    @Column(name = "spotify_access_token", columnDefinition = "TEXT")
    private String spotifyAccessToken;

    @Column(name = "spotify_refresh_token", columnDefinition = "TEXT")
    private String spotifyRefreshToken;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // ── UserDetails — requerido por Spring Security ───────────────────────

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.role));
    }

    @Override
    public String getUsername() {
        return this.email; // Spring Security usa email como identificador
    }

    public String getDisplayUsername() {
        return this.username; // el nombre visible en la UI
    }

    @Override
    public boolean isAccountNonExpired()  { return true; }

    @Override
    public boolean isAccountNonLocked()   { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled()            { return true; }
}
