package com.hundredseconds.api.infrastructure.security;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * @param secret     HMAC secret, at least 32 bytes (256 bits) for HS256
 * @param expiration token lifetime
 * @param issuer     value of the "iss" claim
 */
@ConfigurationProperties(prefix = "security.jwt")
public record JwtProperties(String secret, Duration expiration, String issuer) {
}
