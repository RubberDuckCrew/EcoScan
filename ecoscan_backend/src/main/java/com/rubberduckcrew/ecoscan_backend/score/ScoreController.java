package com.rubberduckcrew.ecoscan_backend.score;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/score")
public class ScoreController {

    private final ScoreService scoreService;

    @PostMapping("/{id}")
    public ResponseEntity<UUID> scoreProduct(@PathVariable final String id) {
        return ResponseEntity.ok(scoreService.scoreProduct(id));
    }

}
