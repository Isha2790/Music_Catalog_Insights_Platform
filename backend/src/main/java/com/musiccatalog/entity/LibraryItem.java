package com.musiccatalog.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Represents a single album saved into a user's personal library.
 * Sourced from the iTunes Search API (public catalog) at save-time,
 * then owned entirely by our own database from that point on.
 */
@Entity
@Table(
        name = "library_item",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "apple_catalog_id"}),
        indexes = {
                @Index(name = "idx_library_item_user", columnList = "user_id"),
                @Index(name = "idx_library_item_genre", columnList = "genre")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LibraryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "apple_catalog_id", nullable = false)
    private Long appleCatalogId;

    @Column(nullable = false)
    private String title;

    @Column(name = "artist_name", nullable = false)
    private String artistName;

    private String genre;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "track_count")
    private Integer trackCount;

    @Column(name = "artwork_url", length = 1024)
    private String artworkUrl;

    @Column(name = "collection_price")
    private Double collectionPrice;

    /** User's personal 1-5 rating of the album, optional. */
    @Column(name = "user_rating")
    private Integer userRating;

    @Column(name = "user_notes", length = 2000)
    private String userNotes;

    @Builder.Default
    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Builder.Default
    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
