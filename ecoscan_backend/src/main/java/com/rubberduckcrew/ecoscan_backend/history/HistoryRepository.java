package com.rubberduckcrew.ecoscan_backend.history;

import com.rubberduckcrew.ecoscan_backend.history.entity.ScanHistory;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HistoryRepository extends PagingAndSortingRepository<ScanHistory, UUID> {
    Slice<ScanHistory> findAllByUserId(UUID userId, Pageable pageable);
}
