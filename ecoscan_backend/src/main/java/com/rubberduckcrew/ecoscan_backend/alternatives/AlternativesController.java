package com.rubberduckcrew.ecoscan_backend.alternatives;

import com.rubberduckcrew.ecoscan_backend.jobs.JobEanService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

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
            @NotNull @RequestParam final String userCoordinates) {
        final UUID jobId = alternativesService.findAlternatives(id, userCoordinates);
        jobEanService.register(jobId, id);
        return ResponseEntity.ok(jobId);
    }
}
