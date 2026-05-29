package com.rubberduckcrew.ecoscan_backend.configuration;

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

    @Bean
    public SecurityFilterChain filterChain(final HttpSecurity http) {
        http
                .authorizeHttpRequests((requests) -> requests
                        .requestMatchers(
                                // allow access to /actuator/info
                                PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.GET, "/actuator/info"),
                                // allow access to /actuator/health for OpenShift Health Check
                                PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.GET, "/actuator/health"),
                                // allow access to /actuator/health/liveness for OpenShift Liveness Check
                                PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.GET, "/actuator/health/liveness"),
                                // allow access to /actuator/health/readiness for OpenShift Readiness Check
                                PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.GET, "/actuator/health/readiness"),
                                // allow access to SBOM overview
                                PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.GET, "/actuator/sbom"),
                                // allow access to opean-api endpoints
                                PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.GET, "/v3/api-docs"),
                                PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.GET, "/v3/api-docs.yaml"),
                                PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.GET, "/v3/api-docs/**"),
                                // allow access to swagger-ui
                                PathPatternRequestMatcher.withDefaults().matcher("/swagger-ui/**"),
                                // allow access to SBOM application data
                                PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.GET, "/actuator/sbom/application"),
                                // allow access to /actuator/metrics for Prometheus monitoring in OpenShift
                                PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.GET, "/actuator/metrics"))
                        .permitAll())
                .authorizeHttpRequests((requests) -> requests
                        .anyRequest()
                        .authenticated())
                .oauth2ResourceServer(oAuth2ResourceServerConfigurer -> oAuth2ResourceServerConfigurer
                        .jwt(jwtConfigurer -> {
                            final JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
                            jwtConfigurer.jwtAuthenticationConverter(jwtAuthenticationConverter);
                        }));

        return http.build();
    }
}
