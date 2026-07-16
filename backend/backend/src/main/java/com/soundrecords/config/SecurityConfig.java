package com.soundrecords.config;

import com.soundrecords.security.JwtFilter;
import com.soundrecords.security.JwtUtil;
import com.soundrecords.security.UserDetailsServiceImpl;

import lombok.RequiredArgsConstructor;

import org.springframework.security.config.Customizer;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        JwtFilter jwtFilter = new JwtFilter(jwtUtil, userDetailsService);
        http
            .cors(Customizer.withDefaults()) 
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Rutas públicas — no necesitan token
                .requestMatchers(
                    "/api/auth/register",
                    "/api/auth/login",
                    "/api/auth/me",
                    "/api/spotify/albums/**",
                    "/api/spotify/search/**",
                    "/api/spotify/trending",
                    "/api/reviews/**",
                    "/api/artists/discover",
                    "/api/artists/**",
                    "/api/payments/plans"  
                ).permitAll()
                // Todo lo demás requiere token válido
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Cambia esto si tu Angular corre en otro puerto
        configuration.setAllowedOrigins(List.of("http://localhost:4200")); 
        // ¡El método OPTIONS es vital aquí!
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"));
        // Permite que pasen los headers de Authorization (tu JWT) y Content-Type
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Aplica estas reglas a todas las rutas de la API
        source.registerCorsConfiguration("/**", configuration); 
        return source;
    }
}
