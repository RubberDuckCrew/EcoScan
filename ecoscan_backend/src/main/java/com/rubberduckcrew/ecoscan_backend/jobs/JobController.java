package com.rubberduckcrew.ecoscan_backend.jobs;

import com.rubberduckcrew.ecoscan_backend.configuration.security.Authorities;
import com.rubberduckcrew.ecoscan_backend.utils.AuthUtils;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@Slf4j
@RequestMapping("/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobSseService jobSseService;

    @GetMapping("/stream/{jobId}")
    @PreAuthorize(Authorities.USER)
    public SseEmitter streamJobResult(@PathVariable final UUID jobId) {
        if (!jobSseService.hasJob(jobId)) {
            log.info("job not found");
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found");
        }
        final UUID userId = AuthUtils.getSub();
        if (!jobSseService.isOwner(jobId, userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return jobSseService.createEmitter(jobId, userId);
    }
}
