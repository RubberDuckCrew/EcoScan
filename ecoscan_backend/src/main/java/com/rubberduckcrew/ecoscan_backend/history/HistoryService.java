package com.rubberduckcrew.ecoscan_backend.history;

import com.rubberduckcrew.ecoscan_backend.history.entity.ScanHistory;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HistoryService {
    private final HistoryRepository historyRepository;

    public Slice<ScanHistory> getUserHistory(final UUID userId, final Pageable pageable) {
        return historyRepository.findAllByUserId(userId, pageable);
    }
}
