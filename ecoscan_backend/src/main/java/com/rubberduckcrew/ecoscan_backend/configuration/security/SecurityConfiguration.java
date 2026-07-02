package com.rubberduckcrew.ecoscan_backend.configuration.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {
    private final KeycloakRolesAuthoritiesConverter keycloakRolesAuthoritiesConverter;

    @Bean
    public SecurityFilterChain filterChain(final HttpSecurity http) {
        http
            .authorizeHttpRequests((requests) -> requests
                .requestMatchers(
                    PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.GET, "/actuator/info"),
                    PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.GET, "/actuator/health"),
                    PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.GET, "/actuator/health/liveness"),
                    PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.GET, "/actuator/health/readiness"),
                    PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.GET, "/actuator/sbom"))
                .permitAll())
            .authorizeHttpRequests((requests) -> requests
                .anyRequest()
                .authenticated())
            .oauth2ResourceServer(oAuth2ResourceServerConfigurer -> oAuth2ResourceServerConfigurer
                .jwt(jwtConfigurer -> {
                    final JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
                    jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(keycloakRolesAuthoritiesConverter);
                    jwtConfigurer.jwtAuthenticationConverter(jwtAuthenticationConverter);
                }));

        return http.build();
    }
}
