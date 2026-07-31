package com.musiccatalog.service;

import com.musiccatalog.dto.response.AnalyticsResponse;
import com.musiccatalog.entity.LibraryItem;
import com.musiccatalog.repository.LibraryItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private LibraryItemRepository repository;

    @InjectMocks
    private AnalyticsService analyticsService;

    private static final Long USER_ID = 1L;

    @BeforeEach
    void setUp() {
        List<LibraryItem> items = List.of(
                item("Parachutes", "Coldplay", "Alternative", "2000-07-10", 10, 4),
                item("A Rush of Blood to the Head", "Coldplay", "Alternative", "2002-08-26", 11, 5),
                item("Discovery", "Daft Punk", "Electronic", "2001-03-12", 14, 5),
                item("1989", "Taylor Swift", "Pop", "2014-10-27", 13, null)
        );
        when(repository.findByUserIdOrderByCreatedAtDesc(USER_ID)).thenReturn(items);
    }

    @Test
    void computeReturnsCorrectTotals() {
        AnalyticsResponse result = analyticsService.compute(USER_ID);

        assertEquals(4, result.totalAlbums());
        assertEquals(48, result.totalTracks());
        assertEquals(2, result.genreDistribution().get("Alternative"));
        assertEquals(1, result.genreDistribution().get("Electronic"));
    }

    @Test
    void computeGroupsReleasesByYear() {
        AnalyticsResponse result = analyticsService.compute(USER_ID);

        assertEquals(1L, result.releasesByYear().get(2000));
        assertEquals(1L, result.releasesByYear().get(2014));
    }

    @Test
    void computeHandlesEmptyLibrary() {
        when(repository.findByUserIdOrderByCreatedAtDesc(2L)).thenReturn(List.of());
        AnalyticsResponse result = analyticsService.compute(2L);

        assertEquals(0, result.totalAlbums());
        assertTrue(result.genreDistribution().isEmpty());
    }

    @Test
    void computeIdentifiesTopArtist() {
        AnalyticsResponse result = analyticsService.compute(USER_ID);

        assertEquals("Coldplay", result.topArtists().get(0).artistName());
        assertEquals(2, result.topArtists().get(0).albumCount());
    }

    private LibraryItem item(String title, String artist, String genre, String releaseDate,
                              int trackCount, Integer rating) {
        return LibraryItem.builder()
                .userId(USER_ID)
                .appleCatalogId((long) title.hashCode())
                .title(title)
                .artistName(artist)
                .genre(genre)
                .releaseDate(LocalDate.parse(releaseDate))
                .trackCount(trackCount)
                .userRating(rating)
                .build();
    }
}
