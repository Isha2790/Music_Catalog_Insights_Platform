package com.musiccatalog.service;

import com.musiccatalog.dto.request.SaveLibraryItemRequest;
import com.musiccatalog.dto.request.UpdateLibraryItemRequest;
import com.musiccatalog.dto.response.LibraryItemResponse;
import com.musiccatalog.entity.LibraryItem;
import com.musiccatalog.exception.DuplicateResourceException;
import com.musiccatalog.exception.ResourceNotFoundException;
import com.musiccatalog.repository.LibraryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LibraryService {

    private final LibraryItemRepository repository;

    public List<LibraryItemResponse> getLibrary(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public LibraryItemResponse save(Long userId, SaveLibraryItemRequest request) {
        if (repository.existsByUserIdAndAppleCatalogId(userId, request.appleCatalogId())) {
            throw new DuplicateResourceException("This album is already in your library");
        }

        LibraryItem item = LibraryItem.builder()
                .userId(userId)
                .appleCatalogId(request.appleCatalogId())
                .title(request.title())
                .artistName(request.artistName())
                .genre(request.genre())
                .releaseDate(parseDate(request.releaseDate()))
                .trackCount(request.trackCount())
                .artworkUrl(request.artworkUrl())
                .collectionPrice(request.collectionPrice())
                .userRating(request.userRating())
                .userNotes(request.userNotes())
                .build();

        return toResponse(repository.save(item));
    }

    @Transactional
    public LibraryItemResponse update(Long userId, Long itemId, UpdateLibraryItemRequest request) {
        LibraryItem item = repository.findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Library item not found"));

        if (request.userRating() != null) {
            item.setUserRating(request.userRating());
        }
        if (request.userNotes() != null) {
            item.setUserNotes(request.userNotes());
        }

        return toResponse(repository.save(item));
    }

    @Transactional
    public void delete(Long userId, Long itemId) {
        repository.findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Library item not found"));
        repository.deleteByIdAndUserId(itemId, userId);
    }

    private LocalDate parseDate(String isoOrDateTime) {
        if (isoOrDateTime == null || isoOrDateTime.isBlank()) {
            return null;
        }
        try {
            // iTunes gives us e.g. 2000-07-10T12:00:00Z
            return LocalDate.parse(isoOrDateTime.substring(0, 10));
        } catch (DateTimeParseException | StringIndexOutOfBoundsException e) {
            return null;
        }
    }

    private LibraryItemResponse toResponse(LibraryItem item) {
        return new LibraryItemResponse(
                item.getId(),
                item.getAppleCatalogId(),
                item.getTitle(),
                item.getArtistName(),
                item.getGenre(),
                item.getReleaseDate(),
                item.getTrackCount(),
                item.getArtworkUrl(),
                item.getCollectionPrice(),
                item.getUserRating(),
                item.getUserNotes(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}
