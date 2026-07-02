package com.rubberduckcrew.ecoscan_backend.score;

import com.rubberduckcrew.ecoscan_backend.configuration.security.Authorities;
import com.rubberduckcrew.ecoscan_backend.jobs.JobEanService;
import com.rubberduckcrew.ecoscan_backend.utils.AuthUtils;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/score")
public class ScoreController {

    private final ScoreService scoreService;
    private final JobEanService jobEanService;

    @PostMapping("/{id}")
    @PreAuthorize(Authorities.USER)
    public ResponseEntity<UUID> scoreProduct(@PathVariable final String id) {
        final UUID userId = AuthUtils.getSub();
        final UUID jobId = scoreService.scoreProduct(id, userId);
        jobEanService.register(jobId, id);
        return ResponseEntity.ok(jobId);
    }

}
