package com.rubberduckcrew.ecoscan_backend.products;

import com.rubberduckcrew.ecoscan_backend.alternatives.HandleAlternativeService;
import com.rubberduckcrew.ecoscan_backend.common.AiDTO;
import com.rubberduckcrew.ecoscan_backend.jobs.JobAlternativeService;
import com.rubberduckcrew.ecoscan_backend.jobs.JobEanService;
import com.rubberduckcrew.ecoscan_backend.jobs.JobSseService;
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
    private final JobSseService jobSseService;
    private final ProductRepository productRepository;
    private final JobAlternativeService jobAlternativeService;
    private final HandleAlternativeService handleAlternativesService;
    private final JobEanService jobEanService;

    public UUID analyzeProduct(final Product product) {
        final Optional<UUID> existingJobId = jobEanService.getJobId(product.getId());
        if (existingJobId.isPresent()) {
            log.info("A job is already running for product {} with jobId {}", product.getId(), existingJobId.get());
            return existingJobId.get();
        }
        log.info("Analyzing product {}", product.getId());
        final AiDTO<ProductAnalysisRequestDTO> request = new AiDTO<>(
            UUID.randomUUID(),
            new ProductAnalysisRequestDTO(
                product.getName(),
                product.getCategories(),
                product.getId()));
        rabbitTemplate.convertAndSend(
            "ecoscan.ai.tasks.product-analysis",
            request);
        jobEanService.register(request.jobId(), product.getId());
        return request.jobId();
    }

    @RabbitListener(queuesToDeclare = @Queue("ecoscan.ai.results.product-analysis"))
    public void handleProductAnalysisResponse(final AiDTO<ProductAnalysisResponseDTO> response) {
        final ProductAnalysisResponseDTO result = response.data();
        log.info("Received ProductAnalysis results: {}", result.toString());

        final String productId = jobEanService.getEan(response.jobId()).orElse(null);
        if (productId == null) {
            log.warn("Dropping analysis result for missing product in job {}", response.jobId());
            return;
        }
        final Product p = productRepository.getProductById(productId).orElse(null);
        if (p == null) {
            log.warn("Dropping analysis result for missing product {}", productId);
            return;
        }
        p.setDescription(result.description());
        p.setData(result.data());
        productRepository.save(p);

        final Optional<UUID> alternativesJobId = jobAlternativeService.getAlternativesJobId(response.jobId());
        if (alternativesJobId.isPresent()) {
            handleAlternativesService.handleAlternativeProduct(p, alternativesJobId.get());
            jobEanService.remove(response.jobId());
            return;
        }
        jobSseService.send(response.jobId(), "product-analysis-evaluation", p);
        jobEanService.remove(response.jobId());
        jobSseService.complete(response.jobId());
    }
}
