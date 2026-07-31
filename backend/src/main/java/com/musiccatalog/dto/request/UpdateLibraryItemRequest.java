package com.musiccatalog.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record UpdateLibraryItemRequest(
        @Min(1) @Max(5)
        Integer userRating,

        @Size(max = 2000)
        String userNotes
) {
}
