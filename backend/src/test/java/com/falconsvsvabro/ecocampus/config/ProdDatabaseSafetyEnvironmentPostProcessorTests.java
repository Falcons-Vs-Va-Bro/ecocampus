package com.falconsvsvabro.ecocampus.config;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.falconsvsvabro.ecocampus.EcoCampusApplication;
import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.mock.env.MockEnvironment;

class ProdDatabaseSafetyEnvironmentPostProcessorTests {

	private final ProdDatabaseSafetyEnvironmentPostProcessor postProcessor = new ProdDatabaseSafetyEnvironmentPostProcessor();

	@Test
	void skipsValidationOutsideProdProfile() {
		MockEnvironment environment = new MockEnvironment()
			.withProperty("spring.datasource.url", "jdbc:h2:mem:ecocampus");

		assertThatCode(() -> postProcessor.postProcessEnvironment(environment, application())).doesNotThrowAnyException();
	}

	@Test
	void acceptsSafeMysqlProductionConfiguration() {
		MockEnvironment environment = validProdEnvironment();

		assertThatCode(() -> postProcessor.postProcessEnvironment(environment, application())).doesNotThrowAnyException();
	}

	@Test
	void rejectsH2UrlInProdProfile() {
		MockEnvironment environment = validProdEnvironment()
			.withProperty("spring.datasource.url", "jdbc:h2:mem:ecocampus");

		assertThatThrownBy(() -> postProcessor.postProcessEnvironment(environment, application()))
			.isInstanceOf(IllegalStateException.class)
			.hasMessageContaining("jdbc:mysql");
	}

	@Test
	void rejectsDefaultDatabaseUsernameInProdProfile() {
		MockEnvironment environment = validProdEnvironment().withProperty("spring.datasource.username", "root");

		assertThatThrownBy(() -> postProcessor.postProcessEnvironment(environment, application()))
			.isInstanceOf(IllegalStateException.class)
			.hasMessageContaining("dedicated production MySQL user");
	}

	@Test
	void rejectsExamplePasswordInProdProfile() {
		MockEnvironment environment = validProdEnvironment().withProperty("spring.datasource.password", "change_me");

		assertThatThrownBy(() -> postProcessor.postProcessEnvironment(environment, application()))
			.isInstanceOf(IllegalStateException.class)
			.hasMessageContaining("real secret");
	}

	@Test
	void rejectsUnsafeDdlAutoInProdProfile() {
		MockEnvironment environment = validProdEnvironment()
			.withProperty("spring.jpa.hibernate.ddl-auto", "update");

		assertThatThrownBy(() -> postProcessor.postProcessEnvironment(environment, application()))
			.isInstanceOf(IllegalStateException.class)
			.hasMessageContaining("ddl-auto");
	}

	@Test
	void rejectsInvalidHikariPoolSizingInProdProfile() {
		MockEnvironment environment = validProdEnvironment()
			.withProperty("spring.datasource.hikari.maximum-pool-size", "2")
			.withProperty("spring.datasource.hikari.minimum-idle", "3");

		assertThatThrownBy(() -> postProcessor.postProcessEnvironment(environment, application()))
			.isInstanceOf(IllegalStateException.class)
			.hasMessageContaining("minimum-idle");
	}

	private MockEnvironment validProdEnvironment() {
		MockEnvironment environment = new MockEnvironment()
			.withProperty("spring.datasource.url",
					"jdbc:mysql://mysql.example.internal:3306/ecocampus?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai")
			.withProperty("spring.datasource.driver-class-name", "com.mysql.cj.jdbc.Driver")
			.withProperty("spring.datasource.username", "ecocampus_app")
			.withProperty("spring.datasource.password", "prod-secret-value")
			.withProperty("spring.jpa.hibernate.ddl-auto", "validate")
			.withProperty("spring.sql.init.mode", "never")
			.withProperty("spring.flyway.enabled", "true")
			.withProperty("spring.datasource.hikari.maximum-pool-size", "20")
			.withProperty("spring.datasource.hikari.minimum-idle", "5")
			.withProperty("spring.datasource.hikari.connection-timeout", "30000")
			.withProperty("spring.datasource.hikari.validation-timeout", "5000")
			.withProperty("spring.datasource.hikari.idle-timeout", "600000")
			.withProperty("spring.datasource.hikari.max-lifetime", "1800000")
			.withProperty("spring.datasource.hikari.leak-detection-threshold", "0");
		environment.setActiveProfiles("prod");
		return environment;
	}

	private SpringApplication application() {
		return new SpringApplication(EcoCampusApplication.class);
	}
}
