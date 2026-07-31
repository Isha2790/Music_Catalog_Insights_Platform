package com.musiccatalog.dto.response;

public record CatalogSearchResult(
        Long appleCatalogId,
        String title,
        String artistName,
        String genre,
        String releaseDate,
        Integer trackCount,
        String artworkUrl,
        Double collectionPrice
) {
}
