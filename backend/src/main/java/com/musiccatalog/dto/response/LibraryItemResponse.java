package com.musiccatalog.dto.response;

import java.time.Instant;
import java.time.LocalDate;

public record LibraryItemResponse(
        Long id,
        Long appleCatalogId,
        String title,
        String artistName,
        String genre,
        LocalDate releaseDate,
        Integer trackCount,
        String artworkUrl,
        Double collectionPrice,
        Integer userRating,
        String userNotes,
        Instant createdAt,
        Instant updatedAt
) {
}
