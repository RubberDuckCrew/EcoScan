package com.rubberduckcrew.ecoscan_backend.history;

import com.rubberduckcrew.ecoscan_backend.common.SliceDTO;
import com.rubberduckcrew.ecoscan_backend.history.dto.HistoryStatsDTO;
import com.rubberduckcrew.ecoscan_backend.history.dto.ScanHistoryDTO;
import com.rubberduckcrew.ecoscan_backend.history.entity.ScanHistory;
import com.rubberduckcrew.ecoscan_backend.utils.AuthUtils;
import jakarta.validation.constraints.Min;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("history")
@RequiredArgsConstructor
public class HistoryController {
    private final HistoryService historyService;
    private final HistoryMapper historyMapper;

    @GetMapping
    @Validated
    public SliceDTO<ScanHistoryDTO> getHistory(@RequestParam(defaultValue = "0") @Min(0) final int page) {
        final UUID userId = AuthUtils.getSub();
        final Pageable pageable = PageRequest.of(page, 10, Sort.by("savedDate").descending());
        final Slice<ScanHistory> history = historyService.getUserHistory(userId, pageable);
        final List<ScanHistoryDTO> historyDtos = history.getContent().stream()
            .map(historyMapper::toDTO)
            .toList();
        return new SliceDTO<>(historyDtos, history.hasNext(), history.getNumber());
    }

    @GetMapping("stats")
    public HistoryStatsDTO getHistoryStats() {
        final UUID userId = AuthUtils.getSub();
        return historyService.getHistoryStats(userId);
    }

    @GetMapping("savings")
    @Validated
    public UUID getSavings() {
        final UUID userId = AuthUtils.getSub();
        return historyService.getSavings(userId);
    }
}
