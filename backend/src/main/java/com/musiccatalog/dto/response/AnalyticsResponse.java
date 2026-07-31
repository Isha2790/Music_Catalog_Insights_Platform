package com.musiccatalog.dto.response;

import java.util.List;
import java.util.Map;

public record AnalyticsResponse(
        int totalAlbums,
        double averageRating,
        int totalTracks,
        double averageTrackCount,
        Map<String, Long> genreDistribution,
        Map<Integer, Long> releasesByYear,
        Map<Integer, Long> ratingDistribution,
        List<ArtistCount> topArtists,
        Map<String, Long> decadeDistribution
) {
    public record ArtistCount(String artistName, long albumCount) {}
}
