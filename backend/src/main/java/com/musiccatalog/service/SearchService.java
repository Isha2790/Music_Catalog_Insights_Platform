package com.musiccatalog.service;

import com.musiccatalog.dto.response.CatalogSearchResult;
import com.musiccatalog.itunes.ItunesClient;
import com.musiccatalog.itunes.ItunesResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final ItunesClient itunesClient;

    /**
     * Our project focus is ALBUMS (see README for rationale), so we always
     * query the iTunes API with entity=album regardless of what the client sends,
     * but we keep the `type` param for forward-compatibility with songs/artists.
     */
    public List<CatalogSearchResult> search(String query, String type, int limit) {
        if (!StringUtils.hasText(query)) {
            return List.of();
        }

        String entity = switch (type == null ? "album" : type.toLowerCase()) {
            case "song" -> "song";
            case "artist" -> "musicArtist";
            default -> "album";
        };

        var response = itunesClient.search(query.trim(), entity, Math.min(Math.max(limit, 1), 50));

        return response.results().stream()
                .filter(r -> r.collectionId() != null || r.trackId() != null)
                .map(this::toCatalogResult)
                .toList();
    }

    private CatalogSearchResult toCatalogResult(ItunesResult r) {
        Long id = r.collectionId() != null ? r.collectionId() : r.trackId();
        String title = r.collectionName() != null ? r.collectionName() : r.trackName();

        // Upgrade the default 100x100 thumbnail to a sharper 300x300 artwork.
        String artwork = r.artworkUrl100() != null
                ? r.artworkUrl100().replace("100x100", "300x300")
                : null;

        return new CatalogSearchResult(
                id,
                title,
                r.artistName(),
                r.primaryGenreName(),
                r.releaseDate(),
                r.trackCount(),
                artwork,
                r.collectionPrice()
        );
    }
}
