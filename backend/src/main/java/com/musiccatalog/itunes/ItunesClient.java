package com.musiccatalog.itunes;

import com.musiccatalog.exception.UpstreamServiceException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * Thin client around the public, keyless iTunes Search API.
 * https://itunes.apple.com/search
 *
 * We keep this as a dedicated component so the rest of the app never talks
 * to the third party directly - it goes through our own /api/search proxy,
 * which lets us cache, rate-limit and reshape the response.
 */
@Slf4j
@Component
public class ItunesClient {

    private final RestClient restClient;

    public ItunesClient(@Value("${app.itunes.base-url}") String baseUrl) {
        var jsonConverter = new org.springframework.http.converter.json.MappingJackson2HttpMessageConverter();
        jsonConverter.setSupportedMediaTypes(java.util.List.of(
                org.springframework.http.MediaType.APPLICATION_JSON,
                new org.springframework.http.MediaType("text", "javascript", java.nio.charset.StandardCharsets.UTF_8)
        ));

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .messageConverters(converters -> {
                    converters.removeIf(c -> c instanceof org.springframework.http.converter.json.MappingJackson2HttpMessageConverter);
                    converters.add(0, jsonConverter);
                })
                .build();
    }

    @Cacheable(cacheNames = "itunesSearch", key = "#term + ':' + #entity + ':' + #limit")
    public ItunesSearchResponse search(String term, String entity, int limit) {
        try {
            String uri = UriComponentsBuilder.fromPath("/search")
                    .queryParam("term", term)
                    .queryParam("entity", entity)
                    .queryParam("limit", limit)
                    .build()
                    .toUriString();

            log.info("Calling iTunes Search API: {}", uri);

            ItunesSearchResponse response = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(ItunesSearchResponse.class);

            if (response == null) {
                throw new UpstreamServiceException("iTunes API returned an empty response");
            }
            return response;
        } catch (UpstreamServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("iTunes API call failed", e);
            throw new UpstreamServiceException("Unable to reach the iTunes catalog right now. Please try again shortly.");
        }
    }
}
