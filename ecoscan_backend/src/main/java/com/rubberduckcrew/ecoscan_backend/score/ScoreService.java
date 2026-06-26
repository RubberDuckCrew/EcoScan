package com.rubberduckcrew.ecoscan_backend.score;

import com.rubberduckcrew.ecoscan_backend.common.AiDTO;
import com.rubberduckcrew.ecoscan_backend.jobs.JobEanService;
import com.rubberduckcrew.ecoscan_backend.jobs.SseService;
import com.rubberduckcrew.ecoscan_backend.products.ProductService;
import com.rubberduckcrew.ecoscan_backend.products.entity.Product;
import com.rubberduckcrew.ecoscan_backend.score.dto.GreenScoreResultDTO;
import com.rubberduckcrew.ecoscan_backend.score.dto.ScoreRequestDTO;
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
public class ScoreService {

    private final ProductService productService;
    private final JobEanService jobEanService;
    private final RabbitTemplate rabbitTemplate;
    private final SseService sseService;

    @RabbitListener(queuesToDeclare = @Queue("ecoscan.ai.results.score"))
    public void handleSavingsResult(final AiDTO<GreenScoreResultDTO> result) {
        final UUID jobId = result.jobId();
        final Integer score = result.data().overallScore();
        if (score == null) {
            log.error("Job result from {} has null overallScore", jobId);
            jobEanService.remove(jobId);
            sseService.complete(jobId);
            return;
        }
        log.info("Job ID: {}, Score: {}", jobId, score);

        final String id = jobEanService.getEan(jobId).orElse(null);
        if (id == null) {
            log.error("Job ID {} has no EAN", jobId);
        } else {
            productService.addScannedProduct(id, result.data());
        }
        jobEanService.remove(jobId);
        sseService.send(result.jobId(), "product-evaluation", result.data());
        sseService.complete(result.jobId());
    }

    public UUID scoreProduct(final String id) {

        final Product product = productService.getProduct(id);

        final AiDTO<ScoreRequestDTO> request = new AiDTO<>(
            UUID.randomUUID(),
            new ScoreRequestDTO(product.getData()));
        rabbitTemplate.convertAndSend(
            "ecoscan.ai.tasks.score",
            request);

        return request.jobId();
    }

}
