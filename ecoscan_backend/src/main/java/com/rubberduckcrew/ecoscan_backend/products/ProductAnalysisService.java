package com.rubberduckcrew.ecoscan_backend.products;

import com.rubberduckcrew.ecoscan_backend.alternatives.HandleAlternativeService;
import com.rubberduckcrew.ecoscan_backend.common.AiDTO;
import com.rubberduckcrew.ecoscan_backend.jobs.JobAlternativeService;
import com.rubberduckcrew.ecoscan_backend.jobs.SseService;
import com.rubberduckcrew.ecoscan_backend.products.dto.ProductAnalysisRequestDTO;
import com.rubberduckcrew.ecoscan_backend.products.dto.ProductAnalysisResponseDTO;
import com.rubberduckcrew.ecoscan_backend.products.entity.Product;

import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductAnalysisService {
    private final RabbitTemplate rabbitTemplate;
    private final SseService sseService;
    private final ProductRepository productRepository;
    private final JobAlternativeService jobAlternativeService;
    private final HandleAlternativeService handleAlternativesService;

    public UUID analyzeProduct(final Product product) {
        log.info("Analyzing product {}", product.getId());
        final AiDTO<ProductAnalysisRequestDTO> request = new AiDTO<>(
            UUID.randomUUID(),
            new ProductAnalysisRequestDTO(
                product.getName(),
                product.getDescription(),
                product.getId()));
        rabbitTemplate.convertAndSend(
            "ecoscan.ai.tasks.product-analysis",
            request);
        return request.jobId();
    }

    @RabbitListener(queuesToDeclare = @Queue("ecoscan.ai.results.product-analysis"))
    public void handleProductAnalysisResponse(final AiDTO<ProductAnalysisResponseDTO> response) {
        final ProductAnalysisResponseDTO result = response.data();
        log.info("Received ProductAnalysis results: {}", result.data());
        final Product p = productRepository.getProductById(result.productId()).orElse(null);
        if (p == null) {
            log.warn("Dropping analysis result for missing product {}", result.productId());
            sseService.complete(response.jobId());
            return;
        }
        p.setData(result.data());
        productRepository.save(p);

        final Optional<UUID> alternativesJobId = jobAlternativeService.getAlternativesJobId(response.jobId());
        if (alternativesJobId.isPresent()) {
            handleAlternativesService.handleAlternativeProduct(p);
            return;
        }
        sseService.send(response.jobId(), "product-analysis-evaluation", p);
        sseService.complete(response.jobId());
    }
}
