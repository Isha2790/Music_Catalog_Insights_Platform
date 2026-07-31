package com.musiccatalog.ai;

import com.musiccatalog.dto.response.AnalyticsResponse;
import com.musiccatalog.dto.response.InsightResponse;
import com.musiccatalog.entity.LibraryItem;
import com.musiccatalog.repository.LibraryItemRepository;
import com.musiccatalog.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

/**
 * AI FEATURE — "Trend Summary & Recommendations".
 *
 * Design decision (see README for full write-up):
 * We implement a deterministic, explainable heuristic insight engine as the
 * primary path, because it works with zero external dependencies, zero cost,
 * and zero latency risk — ideal for a demo/grading environment. If an
 * OpenAI-compatible LLM endpoint is configured via app.ai.provider-url /
 * app.ai.provider-api-key, the service will instead ask the LLM to turn the
 * same structured stats into a more natural narrative. Either path returns
 * the identical InsightResponse shape, so the frontend never needs to know
 * which one served the request (the `source` field tells the UI, purely for
 * transparency).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiInsightService {

    private final LibraryItemRepository repository;
    private final AnalyticsService analyticsService;
    private final LlmClient llmClient;

    @Value("${app.ai.provider-api-key:}")
    private String providerApiKey;

    public InsightResponse generateInsights(Long userId) {
        List<LibraryItem> items = repository.findByUserIdOrderByCreatedAtDesc(userId);

        if (items.isEmpty()) {
            return new InsightResponse(
                    "Your library is empty",
                    List.of("Save a few albums from Search to unlock personalized insights."),
                    List.of("Try searching for an artist you love to get started."),
                    "heuristic"
            );
        }

        AnalyticsResponse stats = analyticsService.compute(userId);
        InsightResponse heuristic = buildHeuristicInsights(items, stats);

        if (providerApiKey != null && !providerApiKey.isBlank()) {
            try {
                Optional<InsightResponse> llmResult = llmClient.narrate(stats, heuristic);
                if (llmResult.isPresent()) {
                    return llmResult.get();
                }
            } catch (Exception e) {
                log.warn("LLM insight generation failed, falling back to heuristic engine: {}", e.getMessage());
            }
        }

        return heuristic;
    }

    // ---------------------------------------------------------------
    // Heuristic engine
    // ---------------------------------------------------------------

    private InsightResponse buildHeuristicInsights(List<LibraryItem> items, AnalyticsResponse stats) {
        List<String> insights = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();

        // 1. Dominant genre
        String topGenre = topEntry(stats.genreDistribution());
        if (topGenre != null) {
            long count = stats.genreDistribution().get(topGenre);
            double pct = Math.round((count * 1000.0) / stats.totalAlbums()) / 10.0;
            insights.add(String.format(
                    "%s dominates your library — %.1f%% of your saved albums (%d of %d) fall into this genre.",
                    topGenre, pct, count, stats.totalAlbums()));
        }

        // 2. Genre diversity
        int genreCount = stats.genreDistribution().size();
        if (genreCount == 1) {
            recommendations.add("Your taste is laser-focused on one genre — try searching a neighboring genre to broaden your library.");
        } else if (genreCount >= 6) {
            insights.add(String.format("You're a genre explorer: your %d saved albums span %d different genres.",
                    stats.totalAlbums(), genreCount));
        }

        // 3. Era / decade trend
        String topDecade = topEntry(stats.decadeDistribution());
        if (topDecade != null) {
            long count = stats.decadeDistribution().get(topDecade);
            insights.add(String.format(
                    "The %s is your sweet spot for release era, with %d album%s from that decade.",
                    topDecade, count, count == 1 ? "" : "s"));
        }

        // 4. Recency check
        int currentYear = LocalDate.now().getYear();
        long recentCount = stats.releasesByYear().entrySet().stream()
                .filter(e -> e.getKey() >= currentYear - 3)
                .mapToLong(Map.Entry::getValue)
                .sum();
        if (recentCount == 0 && !stats.releasesByYear().isEmpty()) {
            recommendations.add("Nothing from the last few years yet — search for a recent release to keep your library current.");
        } else if (recentCount > 0) {
            insights.add(String.format("%d album%s in your library came out in the last 3 years — you're keeping up with new releases.",
                    recentCount, recentCount == 1 ? "" : "s"));
        }

        // 5. Ratings
        long ratedCount = items.stream().filter(i -> i.getUserRating() != null).count();
        if (ratedCount > 0) {
            insights.add(String.format("You've rated %d of %d albums, averaging %.1f / 5 stars.",
                    ratedCount, stats.totalAlbums(), stats.averageRating()));

            long fiveStars = items.stream().filter(i -> i.getUserRating() != null && i.getUserRating() == 5).count();
            if (fiveStars > 0) {
                String favArtist = items.stream()
                        .filter(i -> i.getUserRating() != null && i.getUserRating() == 5)
                        .map(LibraryItem::getArtistName)
                        .findFirst().orElse(null);
                if (favArtist != null) {
                    recommendations.add(String.format(
                            "You rated a %s album 5 stars — search for more from artists in a similar style.", favArtist));
                }
            }
        } else {
            recommendations.add("Rate a few albums to help the insight engine tailor recommendations to your taste.");
        }

        // 6. Most-collected artist
        if (!stats.topArtists().isEmpty()) {
            var top = stats.topArtists().get(0);
            if (top.albumCount() > 1) {
                insights.add(String.format("%s is your most-collected artist with %d albums saved.",
                        top.artistName(), top.albumCount()));
            }
        }

        // 7. Track density
        if (stats.averageTrackCount() > 0) {
            insights.add(String.format("Your average album runs %.0f tracks — %s compared to a typical 10-12 track LP.",
                    stats.averageTrackCount(),
                    stats.averageTrackCount() > 12 ? "a bit longer" : stats.averageTrackCount() < 9 ? "a bit shorter" : "right in line"));
        }

        if (recommendations.isEmpty()) {
            recommendations.add("Keep building your library — insights get sharper the more you save and rate.");
        }

        String headline = topGenre != null
                ? String.format("Your library leans into %s%s", topGenre, topDecade != null ? " from the " + topDecade : "")
                : "Here's what your library says about your taste";

        return new InsightResponse(headline, insights, recommendations, "heuristic");
    }

    private String topEntry(Map<String, Long> map) {
        return map.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
    }
}
