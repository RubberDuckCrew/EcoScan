package com.rubberduckcrew.ecoscan_backend.alternatives;

import com.rubberduckcrew.ecoscan_backend.alternatives.dto.AlternativesRequestDTO;
import com.rubberduckcrew.ecoscan_backend.alternatives.dto.AlternativesResultDTO;
import com.rubberduckcrew.ecoscan_backend.common.AiDTO;
import com.rubberduckcrew.ecoscan_backend.food_data.FoodDataRepository;
import com.rubberduckcrew.ecoscan_backend.jobs.JobAlternativeService;
import com.rubberduckcrew.ecoscan_backend.jobs.JobEanService;
import com.rubberduckcrew.ecoscan_backend.jobs.SseService;
import com.rubberduckcrew.ecoscan_backend.products.ProductService;
import com.rubberduckcrew.ecoscan_backend.products.dto.ProductAnalysisResponseDTO;
import com.rubberduckcrew.ecoscan_backend.products.entity.Product;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlternativesService {
    private final ProductService productService;
    private final JobEanService jobEanService;
    private final JobAlternativeService jobAlternativeService;
    private final RabbitTemplate rabbitTemplate;
    private final SseService sseService;
    private final FoodDataRepository foodDataRepository;

    public UUID findAlternatives(final String id, String userCoordinates) {
        //TODO category aus Frontend
        final AiDTO<AlternativesRequestDTO> request = new AiDTO<>(
                UUID.randomUUID(),
                new AlternativesRequestDTO("Kaugummi", userCoordinates));

        rabbitTemplate.convertAndSend("ecoscan.ai.tasks.alternatives", request);
        return request.jobId();
    }

    @RabbitListener(queuesToDeclare = @Queue("ecoscan.ai.results.alternatives"))
    public void handleAlternativesResult(final AiDTO<AlternativesResultDTO> result) {
        final UUID jobIdAlternatives = result.jobId();
        log.info("Alternatives result for job {}", jobIdAlternatives);

//        sseService.send(jobId, "product-alternatives", result.data());
//        sseService.complete(jobId);
//        jobEanService.remove(jobId);

        result.data().alternatives().forEach(alternative -> {
            final String ean = alternative.ean();
            if (ean == null) {
                log.warn("Alternative has no EAN, skipping");
                return;
            }
            try {
                final UUID jobIdAnalyzeProduct = productService.analyzeProduct(ean);
                jobAlternativeService.register(jobIdAnalyzeProduct, jobIdAlternatives);
            } catch (Exception e) {
                log.warn("Failed to analyze alternative product with EAN {}, skipping", ean, e);
            }
        });
    }
}
