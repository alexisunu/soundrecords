package com.soundrecords.service;

import com.soundrecords.config.SpotifyConfig;
import com.soundrecords.dto.AlbumResponse;
import com.soundrecords.dto.ReviewResponse;
import com.soundrecords.repository.ReviewRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SpotifyService {

    private final SpotifyConfig spotifyConfig;
    private final ReviewRepository reviewRepository;

    // Token en memoria — se renueva automáticamente cuando expira
    private String cachedToken = null;
    private long tokenExpiresAt = 0;

    // ── CLIENT CREDENTIALS — token de la app (no del usuario) ────────────────

    private String getClientCredentialsToken() {

        // Si el token aún es válido, lo reutilizamos
        if (cachedToken != null && System.currentTimeMillis() < tokenExpiresAt) {
            return cachedToken;
        }

        // Construimos las credenciales en Base64
        String credentials = spotifyConfig.getClientId()
                + ":" + spotifyConfig.getClientSecret();
        String encoded = Base64.getEncoder()
                .encodeToString(credentials.getBytes());

        // Cuerpo del request
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");

        // Llamada a Spotify
        Map response = WebClient.create()
                .post()
                .uri("https://accounts.spotify.com/api/token")
                .header("Authorization", "Basic " + encoded)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        cachedToken = (String) response.get("access_token");
        int expiresIn = (Integer) response.get("expires_in"); // en segundos
        tokenExpiresAt = System.currentTimeMillis() + (expiresIn * 1000L) - 60000;
        // Le restamos 60 segundos como margen de seguridad

        log.info("Token de Spotify obtenido. Expira en {} segundos", expiresIn);
        return cachedToken;
    }

    // ── BÚSQUEDA DE ÁLBUMES ───────────────────────────────────────────────────

    public List<AlbumResponse> searchAlbums(String query, String genre, String year) {

        String token = getClientCredentialsToken();

        // Construimos el query combinando filtros opcionales
        StringBuilder fullQuery = new StringBuilder(query);
        if (genre != null && !genre.isBlank()) {
            fullQuery.append(" genre:").append(genre);
        }
        if (year != null && !year.isBlank()) {
            fullQuery.append(" year:").append(year);
        }

        // Llamada a Spotify Search API — URL construida directamente
        // Reemplaza tu string actual por este:
        String url = "https://api.spotify.com/v1/search?q="
                + fullQuery.toString().replace(" ", "%20")
                + "&type=album&limit=10&market=CO";

        log.info("URL de búsqueda: {}", url);
        log.info("Token usado: {}", token.substring(0, 20) + "...");

        Map response = WebClient.create()
        .get()
        .uri(url)
        .header("Authorization", "Bearer " + token)
        .retrieve()
        .onStatus(
            status -> status.is4xxClientError(),
            clientResponse -> clientResponse.bodyToMono(String.class)
                .doOnNext(body -> log.error("Error de Spotify: {}", body))
                .then(Mono.error(new RuntimeException("Error Spotify 400")))
        )
        .bodyToMono(Map.class)
        .block();

        Map albums = (Map) response.get("albums");
        List<Map> items = (List<Map>) albums.get("items");

        return items.stream()
                .map(this::mapToAlbumResponse)
                .toList();
    }

    // ── DETALLE DE UN ÁLBUM ───────────────────────────────────────────────────

    public AlbumResponse getAlbumById(String spotifyAlbumId) {

        String token = getClientCredentialsToken();

        Map response = WebClient.create()
                .get()
                .uri("https://api.spotify.com/v1/albums/" + spotifyAlbumId)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        return mapToAlbumResponse(response);
    }

    // ── MAPPER — convierte JSON de Spotify a nuestro DTO ─────────────────────

    private AlbumResponse mapToAlbumResponse(Map album) {

        // Extraemos la portada (primera imagen)
        String coverUrl = null;
        List<Map> images = (List<Map>) album.get("images");
        if (images != null && !images.isEmpty()) {
            coverUrl = (String) images.get(0).get("url");
        }

        // Extraemos el artista principal
        String artistName = null;
        List<Map> artists = (List<Map>) album.get("artists");
        if (artists != null && !artists.isEmpty()) {
            artistName = (String) artists.get(0).get("name");
        }

        // Año de lanzamiento (viene como "2025-06-15", tomamos solo el año)
        String releaseDate = (String) album.get("release_date");
        String releaseYear = releaseDate != null ? releaseDate.substring(0, 4) : null;

        // Tracklist (si viene en la respuesta — solo en detalle de álbum)
        List<String> tracklist = null;
        Map tracks = (Map) album.get("tracks");
        if (tracks != null) {
            List<Map> trackItems = (List<Map>) tracks.get("items");
            if (trackItems != null) {
                tracklist = trackItems.stream()
                        .map(t -> (String) t.get("name"))
                        .toList();
            }
        }

        return AlbumResponse.builder()
                .spotifyAlbumId((String) album.get("id"))
                .name((String) album.get("name"))
                .artist(artistName)
                .coverUrl(coverUrl)
                .releaseYear(releaseYear)
                .tracklist(tracklist)
                .build();
    }

    
}
