package com.rubberduckcrew.ecoscan_backend.savings;

import com.rubberduckcrew.ecoscan_backend.history.HistoryService;
import com.rubberduckcrew.ecoscan_backend.history.entity.ScanHistory;
import com.rubberduckcrew.ecoscan_backend.products.ProductMapper;
import com.rubberduckcrew.ecoscan_backend.products.dto.ProductDataDTO;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SavingsService {
    final HistoryService historyService;
    final ProductMapper productMapper;

    public UUID getSavings(final UUID userId) {
        log.info("Calculating savings for user {}", userId);
        final List<ProductDataDTO> history = historyService.getWeekHistory(userId).stream()
            .map(ScanHistory::getProduct)
            .map(productMapper::toDataDTO)
            .toList();
        log.info("History for user {}: {}", userId, history);
        return UUID.randomUUID();
    }
}
