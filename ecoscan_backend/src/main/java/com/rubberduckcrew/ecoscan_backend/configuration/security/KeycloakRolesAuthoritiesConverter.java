package com.rubberduckcrew.ecoscan_backend.configuration.security;

import jakarta.annotation.Nullable;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

public class KeycloakRolesAuthoritiesConverter implements Converter<Jwt, Collection<GrantedAuthority>> {
    private final JwtGrantedAuthoritiesConverter defaultConverter = new JwtGrantedAuthoritiesConverter();

    @Override
    public Collection<GrantedAuthority> convert(@Nullable final Jwt jwt) {
        if (jwt == null) {
            return Collections.emptySet();
        }
        return Stream
            .concat(
                Optional.of(defaultConverter.convert(jwt)).orElse(Collections.emptySet()).stream(),
                Stream.concat(extractRealmRoles(jwt).stream(), extractClientRoles(jwt).stream()))
            .collect(Collectors.toSet());
    }

    @SuppressWarnings("unchecked")
    private Collection<? extends GrantedAuthority> extractRealmRoles(final Jwt jwt) {
        return Optional.ofNullable((Map<String, Object>) jwt.getClaim("realm_access"))
            .map(realmAccess -> (List<String>) realmAccess.get("roles"))
            .map(roles -> roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toSet()))
            .orElse(Collections.emptySet());
    }

    @SuppressWarnings("unchecked")
    private Collection<? extends GrantedAuthority> extractClientRoles(final Jwt jwt) {
        return Optional.ofNullable((Map<String, Object>) jwt.getClaim("resource_access"))
            .map(resourceAccess -> resourceAccess.values().stream()
                .filter(Map.class::isInstance)
                .map(Map.class::cast)
                .flatMap(clientAccess -> {
                    final Object roles = clientAccess.get("roles");
                    return roles instanceof List ? ((List<String>) roles).stream() : Stream.empty();
                })
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toSet()))
            .orElse(Collections.emptySet());
    }
}