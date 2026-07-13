package com.soundrecords.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    public JwtFilter(JwtUtil jwtUtil, UserDetailsServiceImpl userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        log.debug("JWT filter request={} authHeaderPresent={}", request.getRequestURI(), authHeader != null);
 
        // Si no hay token o no empieza con "Bearer ", dejamos pasar sin autenticar
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
 
        String token = authHeader.substring(7); // Quita "Bearer "
 
        if (jwtUtil.isTokenValid(token)) {
            String username = jwtUtil.extractUsername(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if (userDetails == null) {
                log.warn("JWT token valid but no user details found for username={}", username);
            } else {
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
 
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } else {
            log.warn("Invalid JWT token for request {}", request.getRequestURI());
        }

        filterChain.doFilter(request, response);
    }
}