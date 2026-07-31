package com.musiccatalog.service;

import com.musiccatalog.dto.response.AnalyticsResponse;
import com.musiccatalog.entity.LibraryItem;
import com.musiccatalog.repository.LibraryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final LibraryItemRepository repository;

    public AnalyticsResponse compute(Long userId) {
        List<LibraryItem> items = repository.findByUserIdOrderByCreatedAtDesc(userId);

        if (items.isEmpty()) {
            return new AnalyticsResponse(0, 0, 0, 0, Map.of(), Map.of(), Map.of(), List.of(), Map.of());
        }

        int total = items.size();

        double avgRating = items.stream()
                .filter(i -> i.getUserRating() != null)
                .mapToInt(LibraryItem::getUserRating)
                .average()
                .orElse(0);

        int totalTracks = items.stream()
                .filter(i -> i.getTrackCount() != null)
                .mapToInt(LibraryItem::getTrackCount)
                .sum();

        double avgTrackCount = items.stream()
                .filter(i -> i.getTrackCount() != null)
                .mapToInt(LibraryItem::getTrackCount)
                .average()
                .orElse(0);

        // Genre distribution (Pie/Donut chart)
        Map<String, Long> genreDist = items.stream()
                .map(i -> Optional.ofNullable(i.getGenre()).orElse("Unknown"))
                .collect(Collectors.groupingBy(g -> g, LinkedHashMap::new, Collectors.counting()));

        // Releases by year (Line/Histogram chart)
        Map<Integer, Long> byYear = items.stream()
                .filter(i -> i.getReleaseDate() != null)
                .collect(Collectors.groupingBy(
                        i -> i.getReleaseDate().getYear(),
                        TreeMap::new,
                        Collectors.counting()
                ));

        // Rating distribution (Bar chart, 1-5 stars)
        Map<Integer, Long> ratingDist = new TreeMap<>();
        for (int i = 1; i <= 5; i++) {
            ratingDist.put(i, 0L);
        }
        items.stream()
                .filter(i -> i.getUserRating() != null)
                .forEach(i -> ratingDist.merge(i.getUserRating(), 1L, Long::sum));

        // Top artists (Horizontal bar chart)
        List<AnalyticsResponse.ArtistCount> topArtists = items.stream()
                .collect(Collectors.groupingBy(LibraryItem::getArtistName, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(e -> new AnalyticsResponse.ArtistCount(e.getKey(), e.getValue()))
                .toList();

        // Decade distribution
        Map<String, Long> decadeDist = items.stream()
                .filter(i -> i.getReleaseDate() != null)
                .collect(Collectors.groupingBy(
                        i -> decadeLabel(i.getReleaseDate()),
                        TreeMap::new,
                        Collectors.counting()
                ));

        return new AnalyticsResponse(total, round1(avgRating), totalTracks, round1(avgTrackCount),
                genreDist, byYear, ratingDist, topArtists, decadeDist);
    }

    private String decadeLabel(LocalDate date) {
        int decadeStart = (date.getYear() / 10) * 10;
        return decadeStart + "s";
    }

    private double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}
