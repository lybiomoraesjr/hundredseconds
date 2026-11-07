package com.hundredseconds.api.infrastructure.security;

import java.time.Clock;
import java.time.Instant;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Component;

import com.hundredseconds.api.application.port.TokenIssuer;
import com.hundredseconds.api.domain.model.User;

/**
 * Issues HS256 signed JWTs whose subject is the user id.
 */
@Component
public class JwtTokenIssuer implements TokenIssuer {

	public static final String USERNAME_CLAIM = "username";

	private final JwtEncoder jwtEncoder;
	private final JwtProperties properties;
	private final Clock clock;

	public JwtTokenIssuer(JwtEncoder jwtEncoder, JwtProperties properties, Clock clock) {
		this.jwtEncoder = jwtEncoder;
		this.properties = properties;
		this.clock = clock;
	}

	@Override
	public String issue(User user) {
		Instant now = clock.instant();
		JwtClaimsSet claims = JwtClaimsSet.builder()
			.issuer(properties.issuer())
			.subject(user.id().toString())
			.issuedAt(now)
			.expiresAt(now.plus(properties.expiration()))
			.claim(USERNAME_CLAIM, user.username())
			.build();
		JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
		return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
	}

}
