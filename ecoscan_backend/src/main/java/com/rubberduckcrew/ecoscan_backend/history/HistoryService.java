package com.rubberduckcrew.ecoscan_backend.history;

import com.rubberduckcrew.ecoscan_backend.history.dto.HistoryStatsDTO;
import com.rubberduckcrew.ecoscan_backend.history.entity.ScanHistory;
import com.rubberduckcrew.ecoscan_backend.products.ProductService;
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
    private final ProductService productService;

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

    public List<UUID> getActiveUsers() {
        final LocalDateTime now = LocalDateTime.now();
        final LocalDateTime lastWeek = now.minusDays(7);
        log.info("Getting active users between {} and {}", lastWeek, now);
        return historyRepository.findUserIdsWithScansBetween(lastWeek, now);
    }

    public HistoryStatsDTO getHistoryStats(final UUID userId) {
        log.info("Getting history stats for user {}", userId);
        return new HistoryStatsDTO(
            historyRepository.averageScore(userId),
            historyRepository.countAllByUserId(userId));
    }

    public UUID saveProductToHistory(final UUID userId, final String ean) {
        log.info("Saving product with EAN {} to history for user {}", ean, userId);
        final ScanHistory scanHistory = new ScanHistory();
        scanHistory.setUserId(userId);
        scanHistory.setProduct(productService.getScannedProduct(ean));
        scanHistory.setSavedDate(LocalDateTime.now());
        return historyRepository.save(scanHistory).getId();
    }
}
