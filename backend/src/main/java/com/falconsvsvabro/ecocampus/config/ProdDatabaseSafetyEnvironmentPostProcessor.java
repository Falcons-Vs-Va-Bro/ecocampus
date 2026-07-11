package com.falconsvsvabro.ecocampus.config;

import java.util.Locale;
import java.util.Set;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.context.config.ConfigDataEnvironmentPostProcessor;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.Profiles;

/**
 * 生产环境数据库防呆校验。
 *
 * 这里故意用 EnvironmentPostProcessor，而不是普通 Spring Bean：它会在应用上下文创建前执行，
 * 可以在 Hikari、Flyway 或 JPA 连接到错误数据库之前直接中止启动。
 */
public final class ProdDatabaseSafetyEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

	private static final String MYSQL_DRIVER = "com.mysql.cj.jdbc.Driver";

	// 这些账号常见于本地或示例环境，prod profile 下不允许直接复制使用。
	private static final Set<String> DISALLOWED_USERNAMES = Set.of("root", "sa", "admin", "change_me", "changeme");

	// 拦截明显的示例密码和本地开发密码，避免部署时漏配真实密钥。
	private static final Set<String> DISALLOWED_PASSWORDS = Set.of("change_me", "changeme", "password",
			"password123", "123456", "12345678", "admin", "root", "test", "demo", "example",
			"ecocampus_local_password");

	@Override
	public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
		if (!environment.acceptsProfiles(Profiles.of("prod"))) {
			return;
		}
		validateProdDatabase(environment);
	}

	@Override
	public int getOrder() {
		// 等 Config Data 加载完成后再校验，确保 application-prod.yml 和环境变量都已合并进 Environment。
		return ConfigDataEnvironmentPostProcessor.ORDER + 1;
	}

	private void validateProdDatabase(ConfigurableEnvironment environment) {
		String url = required(environment, "spring.datasource.url");
		String driver = required(environment, "spring.datasource.driver-class-name");
		String username = required(environment, "spring.datasource.username");
		String password = required(environment, "spring.datasource.password");
		String jwtSecret = required(environment, "ecocampus.security.jwt-secret");

		if (!url.toLowerCase(Locale.ROOT).startsWith("jdbc:mysql:")) {
			fail("spring.datasource.url must start with jdbc:mysql: when prod profile is active");
		}
		if (!MYSQL_DRIVER.equals(driver)) {
			fail("spring.datasource.driver-class-name must be " + MYSQL_DRIVER + " when prod profile is active");
		}
		if (DISALLOWED_USERNAMES.contains(normalize(username))) {
			fail("spring.datasource.username must be a dedicated production MySQL user, not a default account");
		}
		if (DISALLOWED_PASSWORDS.contains(normalize(password))) {
			fail("spring.datasource.password must be a real secret, not an example or local-development value");
		}
		if (jwtSecret.length() < 32 || jwtSecret.contains("dev-only") || jwtSecret.contains("change-me")) {
			fail("ecocampus.security.jwt-secret must be an independent secret of at least 32 characters");
		}

		// 生产库结构只能由 Flyway 管理；Hibernate 只负责启动时校验实体与表结构是否匹配。
		String ddlAuto = required(environment, "spring.jpa.hibernate.ddl-auto");
		if (!"validate".equals(normalize(ddlAuto))) {
			fail("spring.jpa.hibernate.ddl-auto must be validate when prod profile is active");
		}
		String sqlInitMode = required(environment, "spring.sql.init.mode");
		if (!"never".equals(normalize(sqlInitMode))) {
			fail("spring.sql.init.mode must be never when prod profile is active");
		}
		String flywayEnabled = required(environment, "spring.flyway.enabled");
		if (!"true".equals(normalize(flywayEnabled))) {
			fail("spring.flyway.enabled must be true when prod profile is active");
		}

		int maxPoolSize = positiveInt(environment, "spring.datasource.hikari.maximum-pool-size");
		int minIdle = nonNegativeInt(environment, "spring.datasource.hikari.minimum-idle");
		if (minIdle > maxPoolSize) {
			fail("spring.datasource.hikari.minimum-idle must not exceed maximum-pool-size");
		}
		positiveLong(environment, "spring.datasource.hikari.connection-timeout");
		positiveLong(environment, "spring.datasource.hikari.validation-timeout");
		positiveLong(environment, "spring.datasource.hikari.idle-timeout");
		positiveLong(environment, "spring.datasource.hikari.max-lifetime");
		nonNegativeLong(environment, "spring.datasource.hikari.leak-detection-threshold");
	}

	private String required(ConfigurableEnvironment environment, String propertyName) {
		String value = environment.getProperty(propertyName);
		if (value == null || value.isBlank()) {
			fail(propertyName + " is required when prod profile is active");
		}
		if (value.contains("${")) {
			fail(propertyName + " contains an unresolved placeholder when prod profile is active");
		}
		return value.trim();
	}

	private int positiveInt(ConfigurableEnvironment environment, String propertyName) {
		int value = integer(environment, propertyName);
		if (value < 1) {
			fail(propertyName + " must be greater than 0 when prod profile is active");
		}
		return value;
	}

	private int nonNegativeInt(ConfigurableEnvironment environment, String propertyName) {
		int value = integer(environment, propertyName);
		if (value < 0) {
			fail(propertyName + " must be greater than or equal to 0 when prod profile is active");
		}
		return value;
	}

	private int integer(ConfigurableEnvironment environment, String propertyName) {
		String value = required(environment, propertyName);
		try {
			return Integer.parseInt(value);
		}
		catch (NumberFormatException exception) {
			fail(propertyName + " must be an integer when prod profile is active");
			return 0;
		}
	}

	private long positiveLong(ConfigurableEnvironment environment, String propertyName) {
		long value = longValue(environment, propertyName);
		if (value < 1) {
			fail(propertyName + " must be greater than 0 when prod profile is active");
		}
		return value;
	}

	private long nonNegativeLong(ConfigurableEnvironment environment, String propertyName) {
		long value = longValue(environment, propertyName);
		if (value < 0) {
			fail(propertyName + " must be greater than or equal to 0 when prod profile is active");
		}
		return value;
	}

	private long longValue(ConfigurableEnvironment environment, String propertyName) {
		String value = required(environment, propertyName);
		try {
			return Long.parseLong(value);
		}
		catch (NumberFormatException exception) {
			fail(propertyName + " must be a long integer when prod profile is active");
			return 0;
		}
	}

	private String normalize(String value) {
		return value.trim().toLowerCase(Locale.ROOT);
	}

	private void fail(String message) {
		throw new IllegalStateException("Unsafe production database configuration: " + message);
	}
}
