package com.hundredseconds.api.domain.repository;

import java.util.Optional;
import java.util.UUID;

import com.hundredseconds.api.domain.model.User;

public interface UserRepository {

	User save(User user);

	Optional<User> findById(UUID id);

	Optional<User> findByEmail(String email);

	boolean existsByEmail(String email);

	boolean existsByUsername(String username);

}
