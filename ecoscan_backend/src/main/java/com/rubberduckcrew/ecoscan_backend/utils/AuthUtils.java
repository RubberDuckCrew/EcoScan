package com.rubberduckcrew.ecoscan_backend.utils;

import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

public final class AuthUtils {

    private AuthUtils() {
    }

    public static UUID getSub() {
        final Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (!(auth instanceof JwtAuthenticationToken jwtAuth)) {
            throw new IllegalStateException("Authentication is not a JwtAuthenticationToken");
        }

        final Object sub = jwtAuth.getTokenAttributes().get("sub");
        if (!(sub instanceof String subStr)) {
            throw new IllegalStateException("JWT token does not contain a valid 'sub' claim");
        }

        try {
            return UUID.fromString(subStr);
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("JWT token contains an invalid 'sub' claim", e);
        }
    }
}
