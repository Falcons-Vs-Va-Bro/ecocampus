package com.falconsvsvabro.ecocampus.config;

import java.nio.file.Path;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class FileStorageConfig implements WebMvcConfigurer {

	private final Path localDir;

	public FileStorageConfig(@Value("${ecocampus.file-storage.local-dir:./storage/uploads}") String localDir) {
		this.localDir = Path.of(localDir).toAbsolutePath().normalize();
	}

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		String location = localDir.toUri().toString();
		if (!location.endsWith("/")) {
			location = location + "/";
		}
		registry.addResourceHandler("/uploads/**").addResourceLocations(location);
	}
}
