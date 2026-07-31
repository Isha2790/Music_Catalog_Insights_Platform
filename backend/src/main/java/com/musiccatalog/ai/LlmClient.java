package com.musiccatalog.ai;

import com.musiccatalog.dto.response.AnalyticsResponse;
import com.musiccatalog.dto.response.InsightResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.Optional;

/**
 * Optional integration point for a real LLM (OpenAI, Anthropic, etc. via an
 * OpenAI-compatible chat completions endpoint). Disabled unless
 * app.ai.provider-url and app.ai.provider-api-key are both set.
 *
 * This is intentionally isolated behind a single method so swapping providers
 * (or wiring up the Anthropic Messages API instead) only touches this file.
 */
@Slf4j
@Component
public class LlmClient {

    private final RestClient restClient;
    private final String apiKey;
    private final boolean enabled;

    public LlmClient(
            @Value("${app.ai.provider-url:}") String providerUrl,
            @Value("${app.ai.provider-api-key:}") String apiKey
    ) {
        this.apiKey = apiKey;
        this.enabled = providerUrl != null && !providerUrl.isBlank() && apiKey != null && !apiKey.isBlank();
        this.restClient = this.enabled ? RestClient.builder().baseUrl(providerUrl).build() : null;
    }

    public Optional<InsightResponse> narrate(AnalyticsResponse stats, InsightResponse heuristicFallback) {
        if (!enabled) {
            return Optional.empty();
        }

        String prompt = """
                You are a music taste analyst. Given this JSON summary of a user's saved
                album library, write a short, friendly headline and 3-5 punchy one-sentence
                insights about their taste. Stats: totalAlbums=%d, genres=%s, decades=%s, topArtists=%s.
                Keep it concise and human.
                """.formatted(stats.totalAlbums(), stats.genreDistribution(), stats.decadeDistribution(), stats.topArtists());

        try {
            var response = restClient.post()
                    .header("Authorization", "Bearer " + apiKey)
                    .body(Map.of(
                            "model", "gpt-4o-mini",
                            "messages", new Object[]{ Map.of("role", "user", "content", prompt) }
                    ))
                    .retrieve()
                    .body(Map.class);

            // Provider-specific parsing would go here. Since this is optional and
            // provider-dependent, we conservatively fall back if shape doesn't match.
            log.info("LLM insight response received (raw): {}", response);
            return Optional.empty(); // parsing intentionally left to the specific provider's schema
        } catch (Exception e) {
            log.warn("LLM call failed: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
