package com.rubberduckcrew.ecoscan_backend.jobs;

import com.rubberduckcrew.ecoscan_backend.configuration.security.Authorities;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobSseService jobSseService;

    @GetMapping("/stream/{jobId}")
    @PreAuthorize(Authorities.USER)
    public SseEmitter streamJobResult(@PathVariable final UUID jobId) {
        return jobSseService.createEmitter(jobId);
    }
}
