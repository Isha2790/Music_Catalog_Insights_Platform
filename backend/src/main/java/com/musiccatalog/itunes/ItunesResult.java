package com.musiccatalog.itunes;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ItunesResult(
        Long collectionId,
        Long trackId,
        String artistName,
        String collectionName,
        String trackName,
        Double collectionPrice,
        String releaseDate,
        Integer trackCount,
        String primaryGenreName,
        String artworkUrl100,
        String collectionViewUrl
) {
}
