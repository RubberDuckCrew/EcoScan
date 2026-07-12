package com.rubberduckcrew.ecoscan_backend.alternatives;

import com.rubberduckcrew.ecoscan_backend.jobs.JobEanService;
import com.rubberduckcrew.ecoscan_backend.utils.AuthUtils;
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

    @PostMapping("/{id}/alternatives")
    public ResponseEntity<UUID> findAlternativeEans(
        @PathVariable final String id,
        @NotNull @RequestParam final String categories) {
        final UUID userId = AuthUtils.getSub();
        final UUID eanJobId = alternativesService.findAlternativeEans(categories, userId);
        jobEanService.register(eanJobId, id);
        return ResponseEntity.ok(eanJobId);
    }

    @PostMapping("/{id}/stores")
    public ResponseEntity<UUID> findAlternativeStores(
        @PathVariable final String id,
        @NotNull @RequestParam final String userCoordinates) {
        final UUID userId = AuthUtils.getSub();
        final UUID storeJobId = alternativesService.findAlternativeStores(userCoordinates, userId);
        return ResponseEntity.ok(storeJobId);
    }
}
