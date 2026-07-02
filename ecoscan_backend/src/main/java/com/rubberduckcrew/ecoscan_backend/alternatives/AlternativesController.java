package com.rubberduckcrew.ecoscan_backend.alternatives;

import com.rubberduckcrew.ecoscan_backend.jobs.JobEanService;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/alternatives")
public class AlternativesController {
    private final AlternativesService alternativesService;
    private final JobEanService jobEanService;

    @PostMapping("/{id}")
    public ResponseEntity<UUID> findAlternatives(
            @PathVariable final String id,
        @NotNull @RequestParam final String categories,
        @NotNull @RequestParam final String userCoordinates) {
        final UUID jobId = alternativesService.findAlternatives(categories, userCoordinates);
        jobEanService.register(jobId, categories);
        return ResponseEntity.ok(jobId);
    }
}
