package com.hundredseconds.api.infrastructure.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;

import com.hundredseconds.api.domain.model.User;

class JwtTokenIssuerTests {

	private static final JwtProperties PROPERTIES = new JwtProperties("unit-test-secret-with-at-least-32-bytes!",
			Duration.ofHours(2), "hundred-seconds-api");

	private final SecurityConfig securityConfig = new SecurityConfig();

	private final User ana = new User(UUID.randomUUID(), "Ana", "ana@mail.com", "hashed", Instant.now());

	private JwtTokenIssuer issuerAt(Instant now) {
		return new JwtTokenIssuer(securityConfig.jwtEncoder(securityConfig.jwtSecretKey(PROPERTIES)), PROPERTIES,
				Clock.fixed(now, ZoneOffset.UTC));
	}

	private JwtDecoder decoder() {
		return securityConfig.jwtDecoder(securityConfig.jwtSecretKey(PROPERTIES), PROPERTIES);
	}

	@Test
	void shouldIssueTokenWithUserIdAsSubjectAndUsernameClaim() {
		Instant now = Instant.now();

		Jwt jwt = decoder().decode(issuerAt(now).issue(ana));

		assertThat(jwt.getSubject()).isEqualTo(ana.id().toString());
		assertThat(jwt.getClaimAsString(JwtTokenIssuer.USERNAME_CLAIM)).isEqualTo("Ana");
		assertThat(jwt.getClaimAsString("iss")).isEqualTo("hundred-seconds-api");
		assertThat(jwt.getExpiresAt()).isEqualTo(now.plus(Duration.ofHours(2)).truncatedTo(java.time.temporal.ChronoUnit.SECONDS));
	}

	@Test
	void decoderShouldRejectExpiredToken() {
		String expired = issuerAt(Instant.now().minus(Duration.ofHours(3))).issue(ana);

		assertThatThrownBy(() -> decoder().decode(expired)).isInstanceOf(JwtException.class);
	}

	@Test
	void decoderShouldRejectTokenSignedWithAnotherSecret() {
		JwtProperties other = new JwtProperties("another-secret-with-at-least-32-bytes!!!", Duration.ofHours(2),
				"hundred-seconds-api");
		String foreign = new JwtTokenIssuer(securityConfig.jwtEncoder(securityConfig.jwtSecretKey(other)), other,
				Clock.systemUTC())
			.issue(ana);

		assertThatThrownBy(() -> decoder().decode(foreign)).isInstanceOf(JwtException.class);
	}

	@Test
	void shouldRefuseShortSecret() {
		assertThatThrownBy(() -> securityConfig
			.jwtSecretKey(new JwtProperties("too-short", Duration.ofHours(1), "hundred-seconds-api")))
			.isInstanceOf(IllegalStateException.class);
	}

}
