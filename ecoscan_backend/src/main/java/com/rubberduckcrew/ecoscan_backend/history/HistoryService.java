package com.rubberduckcrew.ecoscan_backend.history;

import com.rubberduckcrew.ecoscan_backend.history.entity.ScanHistory;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class HistoryService {
    private final HistoryRepository historyRepository;

    public Slice<ScanHistory> getUserHistory(final UUID userId, final Pageable pageable) {
        log.info("Getting history for user {} with pageable {}", userId, pageable);
        return historyRepository.findAllByUserId(userId, pageable);
    }

    public List<ScanHistory> getWeekHistory(final UUID userId) {
        final LocalDateTime now = LocalDateTime.now();
        final LocalDateTime lastWeek = now.minusDays(7);
        log.info("Getting history for user {} between {} and {}", userId, lastWeek, now);
        return historyRepository.findAllByUserIdAndSavedDateBetween(userId, lastWeek, now);
    }
}
