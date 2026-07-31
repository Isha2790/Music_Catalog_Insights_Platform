package com.musiccatalog.controller;

import com.musiccatalog.dto.response.CatalogSearchResult;
import com.musiccatalog.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<List<CatalogSearchResult>> search(
            @RequestParam String query,
            @RequestParam(required = false, defaultValue = "album") String type,
            @RequestParam(required = false, defaultValue = "25") int limit
    ) {
        return ResponseEntity.ok(searchService.search(query, type, limit));
    }
}
