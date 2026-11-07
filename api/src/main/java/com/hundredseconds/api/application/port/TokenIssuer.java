package com.hundredseconds.api.application.port;

import com.hundredseconds.api.domain.model.User;

/**
 * Issues access tokens (JWT) for authenticated users.
 */
public interface TokenIssuer {

	String issue(User user);

}
