package com.musiccatalog.repository;

import com.musiccatalog.entity.LibraryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LibraryItemRepository extends JpaRepository<LibraryItem, Long> {

    List<LibraryItem> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<LibraryItem> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndAppleCatalogId(Long userId, Long appleCatalogId);

    void deleteByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);
}
