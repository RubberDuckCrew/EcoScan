package com.rubberduckcrew.ecoscan_backend;

import com.rubberduckcrew.ecoscan_backend.configuration.security.Authorities;
import java.time.Instant;
import java.util.Map;
import java.util.Objects;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Test {
    @GetMapping("/test")
    @PreAuthorize(Authorities.AI)
    public Map<String, Object> test(final @AuthenticationPrincipal Jwt jwt) {
        return Map.of(
            "message", "Zugriff erfolgreich",
            "clientId", Objects.requireNonNull(jwt.getClaimAsString("azp")),
            "subject", Objects.requireNonNull(jwt.getSubject()),
            "timestamp", Instant.now()
        );
    }
}
