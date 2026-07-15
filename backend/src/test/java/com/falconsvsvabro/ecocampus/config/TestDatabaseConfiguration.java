package com.falconsvsvabro.ecocampus.config;

import java.sql.Connection;
import java.sql.SQLException;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class TestDatabaseConfiguration {

	@Bean
	FlywayMigrationStrategy resetTestDatabaseBeforeMigrate() {
		return flyway -> {
			String databaseUrl;
			try (Connection connection = flyway.getConfiguration().getDataSource().getConnection()) {
				databaseUrl = connection.getMetaData().getURL();
			}
			catch (SQLException exception) {
				throw new IllegalStateException("Unable to inspect the test database URL", exception);
			}

			if (!databaseUrl.matches("jdbc:mysql://[^/]+/[^?]*_test(?:\\?.*)?")) {
				throw new IllegalStateException("Tests may only clean a MySQL database whose name ends with _test");
			}

			flyway.clean();
			flyway.migrate();
		};
	}
}
