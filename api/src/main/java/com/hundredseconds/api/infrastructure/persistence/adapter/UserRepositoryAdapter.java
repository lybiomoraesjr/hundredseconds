package com.hundredseconds.api.infrastructure.persistence.adapter;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import com.hundredseconds.api.domain.model.User;
import com.hundredseconds.api.domain.repository.UserRepository;
import com.hundredseconds.api.infrastructure.persistence.entity.UserJpaEntity;
import com.hundredseconds.api.infrastructure.persistence.springdata.SpringDataUserRepository;

/**
 * Implements the domain port on top of Spring Data JPA.
 */
@Repository
public class UserRepositoryAdapter implements UserRepository {

	private final SpringDataUserRepository repository;

	public UserRepositoryAdapter(SpringDataUserRepository repository) {
		this.repository = repository;
	}

	@Override
	public User save(User user) {
		return toDomain(repository.save(toEntity(user)));
	}

	@Override
	public Optional<User> findById(UUID id) {
		return repository.findById(id).map(UserRepositoryAdapter::toDomain);
	}

	@Override
	public Optional<User> findByEmail(String email) {
		return repository.findByEmail(email).map(UserRepositoryAdapter::toDomain);
	}

	@Override
	public boolean existsByEmail(String email) {
		return repository.existsByEmail(email);
	}

	@Override
	public boolean existsByUsername(String username) {
		return repository.existsByUsername(username);
	}

	private static UserJpaEntity toEntity(User user) {
		return new UserJpaEntity(user.id(), user.username(), user.email(), user.passwordHash(), user.createdAt());
	}

	private static User toDomain(UserJpaEntity entity) {
		return new User(entity.getId(), entity.getUsername(), entity.getEmail(), entity.getPasswordHash(),
				entity.getCreatedAt());
	}

}
