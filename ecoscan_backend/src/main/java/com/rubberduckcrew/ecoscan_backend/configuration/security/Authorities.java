package com.rubberduckcrew.ecoscan_backend.configuration.security;

public final class Authorities {
    public static final String USER = "hasAnyRole('ecoscan-user')";
    public static final String AI = "hasAnyRole('ecoscan-ai')";

    private Authorities() {
    }
}
