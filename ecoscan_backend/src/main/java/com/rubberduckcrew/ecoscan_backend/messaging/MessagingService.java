package com.rubberduckcrew.ecoscan_backend.messaging;

import com.rubberduckcrew.ecoscan_backend.jobs.JobEanService;
import com.rubberduckcrew.ecoscan_backend.jobs.JobService;
import com.rubberduckcrew.ecoscan_backend.products.ProductService;
import com.rubberduckcrew.ecoscanai.model.JobResponseGreenScoreResult;
import com.rubberduckcrew.ecoscanai.model.JobResponseProductAnalysisResult;
import com.rubberduckcrew.ecoscanai.model.JobResponseStr;
import com.rubberduckcrew.ecoscanai.model.ProductAnalysisResult;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessagingService {

    private final JobService jobService;
    private final ProductService productService;
    private final JobEanService jobEanService;

    public void receivedProductAnalysis(final JobResponseProductAnalysisResult msg) {
        final ProductAnalysisResult result = msg.getResult();
        if (result == null) {
            log.error("Job result from {} is null", msg.getJobId());
            return;
        }
        final String productId = result.getProductId();
        try {
            productService.updateProductData(productId, result.getData());
            // optionally notify clients via SSE
            // jobService.sendProcessingStatus(jobId, "product-analysis-complete");
        } catch (Exception e) {
            log.error("Error while processing product analysis", e);
        }
    }

    public void receivedTest(@Payload final JobResponseStr msg) {
        log.info("Received test");
    }

    public void receivedScore(@Payload final JobResponseGreenScoreResult msg) {
        final UUID jobId = msg.getJobId();
        if (msg.getResult() == null) {
            log.error("Job result from {} is null", jobId);
            return;
        }
        final Integer score = msg.getResult().getOverallScore();
        if (score == null) {
            log.error("Job result from {} has null overallScore", jobId);
            return;
        }
        log.info("Job ID: {}, Score: {}", jobId, score);

        final String id = jobEanService.getEan(jobId).orElse(null);
        if (id == null) {
            log.error("Job ID {} has no EAN", jobId);
        } else {
            productService.addScannedProduct(id, msg.getResult());
        }
        jobEanService.remove(jobId);

        jobService.sendProductEvaluation(jobId, msg.getResult());
    }
}
