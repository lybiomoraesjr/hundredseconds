package com.hundredseconds.api;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
class HundredSecondsApplicationTests {

	@Test
	void contextLoads() {
	}

}
