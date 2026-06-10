package com.rubberduckcrew.ecoscan_backend.history;

import com.rubberduckcrew.ecoscan_backend.history.entity.ScanHistory;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface HistoryRepository extends PagingAndSortingRepository<ScanHistory, UUID> {
    Slice<ScanHistory> findAllByUserId(UUID userId, Pageable pageable);

    List<ScanHistory> findAllByUserIdAndSavedDateBetween(UUID userId, LocalDateTime savedDateAfter, LocalDateTime savedDateBefore);

    long countAllByUserId(UUID userId);

    @Query("SELECT COALESCE(AVG(p.score), 0) FROM ScanHistory sh JOIN sh.product p WHERE sh.userId = :userId")
    int averageScore(@Param("userId") UUID userId);
}
