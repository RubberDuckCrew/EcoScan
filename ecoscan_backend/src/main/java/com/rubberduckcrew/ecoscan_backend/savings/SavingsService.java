package com.rubberduckcrew.ecoscan_backend.savings;

import com.rubberduckcrew.ecoscan_backend.history.HistoryService;
import com.rubberduckcrew.ecoscan_backend.history.entity.ScanHistory;
import com.rubberduckcrew.ecoscan_backend.products.ProductMapper;
import com.rubberduckcrew.ecoscan_backend.products.dto.ProductDataDTO;
import com.rubberduckcrew.ecoscanai.api.SavingsApi;
import com.rubberduckcrew.ecoscanai.model.JobResponseSavingsResult;
import com.rubberduckcrew.ecoscanai.model.SavingsRequest;
import jakarta.validation.ValidationException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class SavingsService {
    private final HistoryService historyService;
    private final ProductMapper productMapper;
    private final SavingsApi savingsApi;

    public UUID getSavings(final UUID userId) {
        log.info("Calculating savings for user {}", userId);
        final List<ProductDataDTO> history = historyService.getWeekHistory(userId).stream()
            .map(ScanHistory::getProduct)
            .map(productMapper::toDataDTO)
            .toList();

        final SavingsRequest savingsRequest = new SavingsRequest();
        savingsRequest.setSavingsContext(history.toString());
        final Optional<JobResponseSavingsResult> jobResponse;

        try {
            jobResponse = Optional.ofNullable(savingsApi.savings(savingsRequest));
        } catch (ValidationException e) {
            log.error("OpenAPI client error while evaluating savings", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to score product", e);
        } catch (RestClientException e) {
            log.error("REST client error while evaluating savings", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to score product", e);
        }

        log.info("Created savings job with id {}", jobResponse.map(JobResponseSavingsResult::getJobId));
        return jobResponse.map(JobResponseSavingsResult::getJobId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to score product"));
    }
}
