package com.musiccatalog.controller;

import com.musiccatalog.dto.request.SaveLibraryItemRequest;
import com.musiccatalog.dto.request.UpdateLibraryItemRequest;
import com.musiccatalog.dto.response.LibraryItemResponse;
import com.musiccatalog.security.AuthenticatedUser;
import com.musiccatalog.service.LibraryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/library")
@RequiredArgsConstructor
public class LibraryController {

    private final LibraryService libraryService;

    @GetMapping
    public ResponseEntity<List<LibraryItemResponse>> getLibrary(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(libraryService.getLibrary(user.getId()));
    }

    @PostMapping
    public ResponseEntity<LibraryItemResponse> save(@AuthenticationPrincipal AuthenticatedUser user,
                                                      @Valid @RequestBody SaveLibraryItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(libraryService.save(user.getId(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LibraryItemResponse> update(@AuthenticationPrincipal AuthenticatedUser user,
                                                        @PathVariable Long id,
                                                        @Valid @RequestBody UpdateLibraryItemRequest request) {
        return ResponseEntity.ok(libraryService.update(user.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal AuthenticatedUser user, @PathVariable Long id) {
        libraryService.delete(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
