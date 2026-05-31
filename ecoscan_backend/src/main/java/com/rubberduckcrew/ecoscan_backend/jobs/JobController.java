package com.rubberduckcrew.ecoscan_backend.jobs;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/jobs")
@RequiredArgsConstructor
public class JobController {

    private final SseService sseService;

    @GetMapping("/stream/{jobId}")
    public SseEmitter streamJobResult(@PathVariable final UUID jobId) {
        return sseService.createEmitter(jobId);
    }
}
