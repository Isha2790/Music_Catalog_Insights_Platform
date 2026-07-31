package com.musiccatalog.dto.response;

import java.util.List;

public record InsightResponse(
        String headline,
        List<String> insights,
        List<String> recommendations,
        String source
) {
}
