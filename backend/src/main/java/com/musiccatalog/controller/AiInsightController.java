package com.musiccatalog.controller;

import com.musiccatalog.ai.AiInsightService;
import com.musiccatalog.dto.response.InsightResponse;
import com.musiccatalog.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
public class AiInsightController {

    private final AiInsightService aiInsightService;

    @GetMapping
    public ResponseEntity<InsightResponse> getInsights(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(aiInsightService.generateInsights(user.getId()));
    }
}
