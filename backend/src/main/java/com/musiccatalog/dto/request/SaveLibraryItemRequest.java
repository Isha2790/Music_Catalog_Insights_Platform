package com.musiccatalog.dto.request;

import jakarta.validation.constraints.*;

public record SaveLibraryItemRequest(
        @NotNull(message = "appleCatalogId is required")
        Long appleCatalogId,

        @NotBlank(message = "title is required")
        @Size(max = 500)
        String title,

        @NotBlank(message = "artistName is required")
        @Size(max = 500)
        String artistName,

        @Size(max = 200)
        String genre,

        String releaseDate,

        Integer trackCount,

        @Size(max = 1024)
        String artworkUrl,

        Double collectionPrice,

        @Min(1) @Max(5)
        Integer userRating,

        @Size(max = 2000)
        String userNotes
) {
}
