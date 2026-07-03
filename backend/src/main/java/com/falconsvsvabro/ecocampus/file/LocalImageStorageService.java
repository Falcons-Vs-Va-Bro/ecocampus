package com.falconsvsvabro.ecocampus.file;

import com.falconsvsvabro.ecocampus.common.api.BusinessException;
import com.falconsvsvabro.ecocampus.common.api.ErrorCode;
import com.falconsvsvabro.ecocampus.file.dto.ImageUploadResponse;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import javax.imageio.ImageIO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class LocalImageStorageService {

	private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/gif");

	private final Path localDir;
	private final String publicUrlPrefix;

	public LocalImageStorageService(
			@Value("${ecocampus.file-storage.local-dir:./storage/uploads}") String localDir,
			@Value("${ecocampus.file-storage.public-url-prefix:/uploads}") String publicUrlPrefix) {
		this.localDir = Path.of(localDir).toAbsolutePath().normalize();
		this.publicUrlPrefix = publicUrlPrefix.endsWith("/") ? publicUrlPrefix.substring(0, publicUrlPrefix.length() - 1)
				: publicUrlPrefix;
	}

	public ImageUploadResponse store(MultipartFile file, FileScene scene) {
		if (file == null || file.isEmpty()) {
			throw new BusinessException(ErrorCode.BAD_REQUEST, "image file is required");
		}
		String contentType = file.getContentType();
		if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
			throw new BusinessException(ErrorCode.BAD_REQUEST, "unsupported image content type");
		}
		ImageSize imageSize = readImageSize(file);
		String extension = extensionOf(contentType);
		String filename = UUID.randomUUID() + "." + extension;
		Path sceneDir = localDir.resolve(scene.name());
		Path target = sceneDir.resolve(filename);
		try {
			Files.createDirectories(sceneDir);
			try (InputStream inputStream = file.getInputStream()) {
				Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
			}
		}
		catch (IOException exception) {
			throw new BusinessException(ErrorCode.INTERNAL_ERROR, "failed to store image");
		}
		return new ImageUploadResponse(publicUrlPrefix + "/" + scene.name() + "/" + filename, imageSize.width(),
				imageSize.height());
	}

	private ImageSize readImageSize(MultipartFile file) {
		try (InputStream inputStream = file.getInputStream()) {
			BufferedImage image = ImageIO.read(inputStream);
			if (image == null) {
				throw new BusinessException(ErrorCode.BAD_REQUEST, "invalid image file");
			}
			return new ImageSize(image.getWidth(), image.getHeight());
		}
		catch (IOException exception) {
			throw new BusinessException(ErrorCode.BAD_REQUEST, "invalid image file");
		}
	}

	private String extensionOf(String contentType) {
		return switch (contentType.toLowerCase(Locale.ROOT)) {
			case "image/jpeg" -> "jpg";
			case "image/png" -> "png";
			case "image/gif" -> "gif";
			default -> throw new BusinessException(ErrorCode.BAD_REQUEST, "unsupported image content type");
		};
	}

	private record ImageSize(int width, int height) {
	}
}
