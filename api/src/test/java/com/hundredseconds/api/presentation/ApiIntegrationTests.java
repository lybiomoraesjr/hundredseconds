package com.hundredseconds.api.presentation;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import com.hundredseconds.api.IntegrationTest;
import com.jayway.jsonpath.JsonPath;

/**
 * End-to-end tests of the HTTP contract (section 7 of the spec) against a real database.
 */
@IntegrationTest
@AutoConfigureMockMvc
@Transactional
class ApiIntegrationTests {

	@Autowired
	private MockMvc mockMvc;

	private ResultActions postJson(String url, String body, String token) throws Exception {
		var request = post(url).contentType(MediaType.APPLICATION_JSON).content(body);
		if (token != null) {
			request.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
		}
		return mockMvc.perform(request);
	}

	private String registerAndLogin(String username, String email) throws Exception {
		postJson("/api/auth/register", """
				{"username": "%s", "email": "%s", "password": "secret123"}
				""".formatted(username, email), null).andExpect(status().isCreated());
		String body = postJson("/api/auth/login", """
				{"email": "%s", "password": "secret123"}
				""".formatted(email), null).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
		return JsonPath.read(body, "$.accessToken");
	}

	// ---------- auth ----------

	@Test
	void registerShouldReturnCreatedUserWithoutPassword() throws Exception {
		postJson("/api/auth/register", """
				{"username": "Ana", "email": "Ana@Mail.com", "password": "secret123"}
				""", null)
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.id").isNotEmpty())
			.andExpect(jsonPath("$.username").value("Ana"))
			.andExpect(jsonPath("$.email").value("ana@mail.com"))
			.andExpect(jsonPath("$.password").doesNotExist())
			.andExpect(jsonPath("$.passwordHash").doesNotExist());
	}

	@Test
	void registerShouldRejectDuplicatedEmail() throws Exception {
		registerAndLogin("Ana", "ana@mail.com");

		postJson("/api/auth/register", """
				{"username": "Ana2", "email": "ana@mail.com", "password": "secret123"}
				""", null)
			.andExpect(status().isConflict())
			.andExpect(jsonPath("$.code").value("EMAIL_ALREADY_IN_USE"));
	}

	@Test
	void registerShouldReturnFieldErrors() throws Exception {
		postJson("/api/auth/register", """
				{"username": "", "email": "not-an-email", "password": "123"}
				""", null)
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
			.andExpect(jsonPath("$.errors.username").exists())
			.andExpect(jsonPath("$.errors.email").exists())
			.andExpect(jsonPath("$.errors.password").exists());
	}

	@Test
	void loginShouldRejectWrongPassword() throws Exception {
		registerAndLogin("Ana", "ana@mail.com");

		postJson("/api/auth/login", """
				{"email": "ana@mail.com", "password": "wrong-password"}
				""", null)
			.andExpect(status().isUnauthorized())
			.andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
	}

	@Test
	void loginShouldReturnBearerToken() throws Exception {
		postJson("/api/auth/register", """
				{"username": "Ana", "email": "ana@mail.com", "password": "secret123"}
				""", null);

		postJson("/api/auth/login", """
				{"email": "ana@mail.com", "password": "secret123"}
				""", null)
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.accessToken").isNotEmpty())
			.andExpect(jsonPath("$.tokenType").value("Bearer"))
			.andExpect(jsonPath("$.username").value("Ana"));
	}

	// ---------- scores ----------

	@Test
	void guestShouldSaveScoreWithInformedName() throws Exception {
		postJson("/api/scores", """
				{"gameMode": "EXPONENTIATION", "score": 23, "wrongAnswers": 4, "playerName": "Visitante"}
				""", null)
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.playerName").value("Visitante"))
			.andExpect(jsonPath("$.starsEarned").value(2))
			.andExpect(jsonPath("$.wrongAnswers").value(4))
			.andExpect(jsonPath("$.playedAt").isString());
	}

	@Test
	void guestWithoutNameShouldBeRejected() throws Exception {
		postJson("/api/scores", """
				{"gameMode": "EXPONENTIATION", "score": 23, "wrongAnswers": 0}
				""", null)
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.code").value("INVALID_PLAYER_NAME"));
	}

	@Test
	void implausibleScoreShouldBeRejected() throws Exception {
		postJson("/api/scores", """
				{"gameMode": "EXPONENTIATION", "score": 301, "wrongAnswers": 0, "playerName": "Bot"}
				""", null)
			.andExpect(status().isUnprocessableContent())
			.andExpect(jsonPath("$.code").value("IMPLAUSIBLE_SCORE"));
	}

	@Test
	void unknownGameModeShouldBeRejected() throws Exception {
		postJson("/api/scores", """
				{"gameMode": "MULTIPLICATION", "score": 10, "wrongAnswers": 0, "playerName": "Ana"}
				""", null)
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));

		mockMvc.perform(get("/api/scores/summary").param("mode", "MULTIPLICATION"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
	}

	@Test
	void authenticatedFlowShouldFeedSummaryAndLeaderboards() throws Exception {
		String token = registerAndLogin("Ana", "ana@mail.com");

		postJson("/api/scores", """
				{"gameMode": "EXPONENTIATION", "score": 105, "wrongAnswers": 7, "playerName": "Ignored"}
				""", token)
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.playerName").value("Ana"))
			.andExpect(jsonPath("$.starsEarned").value(10));
		postJson("/api/scores", """
				{"gameMode": "EXPONENTIATION", "score": 120, "wrongAnswers": 0, "playerName": "Bia"}
				""", null).andExpect(status().isCreated());

		// Summary for the logged player
		mockMvc
			.perform(get("/api/scores/summary").param("mode", "EXPONENTIATION")
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.personalBest").value(105))
			.andExpect(jsonPath("$.todayBest").value(120))
			.andExpect(jsonPath("$.yearBest").value(120));

		// Summary for guests has no personal best
		mockMvc.perform(get("/api/scores/summary").param("mode", "EXPONENTIATION"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.personalBest").value(nullValue()));

		// Other mode is separated
		mockMvc.perform(get("/api/scores/summary").param("mode", "ROOT_EXTRACTION"))
			.andExpect(jsonPath("$.todayBest").value(nullValue()));

		// Global daily leaderboard
		mockMvc.perform(get("/api/scores/leaderboard").param("mode", "EXPONENTIATION").param("period", "DAY"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$", hasSize(2)))
			.andExpect(jsonPath("$[0].rank").value(1))
			.andExpect(jsonPath("$[0].playerName").value("Bia"))
			.andExpect(jsonPath("$[1].playerName").value("Ana"));

		// Own results
		mockMvc
			.perform(get("/api/scores/leaderboard").param("mode", "EXPONENTIATION")
				.param("period", "USER")
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$", hasSize(1)))
			.andExpect(jsonPath("$[0].score").value(105));
	}

	@Test
	void ownResultsShouldRequireLogin() throws Exception {
		mockMvc.perform(get("/api/scores/leaderboard").param("mode", "EXPONENTIATION").param("period", "USER"))
			.andExpect(status().isUnauthorized())
			.andExpect(jsonPath("$.code").value("AUTHENTICATION_REQUIRED"));
	}

	@Test
	void invalidTokenShouldBeRejected() throws Exception {
		mockMvc
			.perform(get("/api/scores/summary").param("mode", "EXPONENTIATION")
				.header(HttpHeaders.AUTHORIZATION, "Bearer not-a-valid-token"))
			.andExpect(status().isUnauthorized());
	}

	@Test
	void unknownRoutesShouldRequireAuthentication() throws Exception {
		mockMvc.perform(get("/api/users")).andExpect(status().isUnauthorized());
	}

	@Test
	void healthEndpointShouldBePublic() throws Exception {
		mockMvc.perform(get("/actuator/health")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("UP"));
	}

	@Test
	void otherActuatorEndpointsShouldNotBeExposed() throws Exception {
		mockMvc.perform(get("/actuator/env")).andExpect(status().isUnauthorized());
	}

	@Test
	void corsShouldAllowTheWebAppOrigin() throws Exception {
		mockMvc
			.perform(options("/api/scores").header(HttpHeaders.ORIGIN, "http://localhost:5173")
				.header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST"))
			.andExpect(status().isOk())
			.andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"));

		mockMvc
			.perform(options("/api/scores").header(HttpHeaders.ORIGIN, "http://evil.example")
				.header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST"))
			.andExpect(status().isForbidden());
	}

}
