package com.rubberduckcrew.ecoscan_backend.alternatives;

import com.rubberduckcrew.ecoscan_backend.jobs.JobAlternativeService;
import com.rubberduckcrew.ecoscan_backend.jobs.JobEanService;
import com.rubberduckcrew.ecoscan_backend.jobs.JobSseService;
import com.rubberduckcrew.ecoscan_backend.products.entity.Product;
import com.rubberduckcrew.ecoscan_backend.products.entity.ScannedProduct;
import com.rubberduckcrew.ecoscan_backend.score.ScoreService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor(onConstructor_ = { @Lazy })
@Slf4j
public class HandleAlternativeService {
    private final JobAlternativeService jobAlternativeService;
    private final ScoreService scoreService;
    private final JobSseService jobSseService;
    private final JobEanService jobEanService;

    public void handleAlternativeProduct(final Product alternativeProduct, final UUID jobIdAnalyzeProduct) {
        log.info("Analyzed alternative Product: " + alternativeProduct.toString());
        //        final UUID alternativesJobId = jobAlternativeService.getAlternativesJobId(jobIdAnalyzeProduct).orElse(null);
        //        if (alternativesJobId == null) {
        //            return;
        //        }

        //GreenScore für die analysierte Alternative berechnen
        //        final UUID scoreJobId = scoreService.scoreProduct(alternativeProduct.getId(), alternativesJobId);
        //        jobEanService.register(scoreJobId, alternativeProduct.getId());
        //        jobAlternativeService.register(scoreJobId, alternativesJobId);
        //        jobAlternativeService.remove(jobIdAnalyzeProduct);
    }

    public void handleScannedAlternative(final ScannedProduct scoredAlternative, final UUID alternativesJobId) {
        log.info("Received scanned alternative: " + scoredAlternative);

        jobSseService.send(alternativesJobId, "product-alternatives", scoredAlternative);
        final boolean completed = jobAlternativeService.incrementAlternativesCounter(alternativesJobId);
        if (completed) {
            log.info("limit reached, complete jobSseService (handleScannedAlternative) ");
            jobSseService.complete(alternativesJobId);
        }
    }
}
