package com.rubberduckcrew.ecoscan_backend.configuration.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AuthoritiesConverterConfiguration {
    @Bean
    public KeycloakRolesAuthoritiesConverter keycloakRolesAuthoritiesConverter() {
        return new KeycloakRolesAuthoritiesConverter();
    }
}