package com.falconsvsvabro.ecocampus.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.OffsetDateTime;
import org.springframework.security.crypto.password.PasswordEncoder;

@Entity
@Table(name = "users")
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 20)
	private String phone;

	@Column(name = "password_hash", length = 100)
	private String passwordHash;

	@Column(nullable = false, length = 40)
	private String nickname;

	@Column(length = 500)
	private String avatarUrl;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private UserRole role;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private VerificationStatus verificationStatus;

	@Column(length = 40)
	private String realName;

	@Column(unique = true, length = 32)
	private String studentNo;

	@Column(length = 80)
	private String college;

	@Column(length = 20)
	private String grade;

	@Column(length = 255)
	private String blacklistReason;

	private OffsetDateTime blacklistExpireAt;

	// 乐观锁版本号：防止资料更新、校园核验和黑名单治理并发覆盖。
	@Version
	@Column(nullable = false)
	private long version;

	@Column(nullable = false)
	private OffsetDateTime createdAt;

	@Column(nullable = false)
	private OffsetDateTime updatedAt;

	protected User() {
	}

	private User(String phone) {
		this.phone = phone;
		this.nickname = "Eco User";
		this.role = UserRole.USER;
		this.verificationStatus = VerificationStatus.UNVERIFIED;
	}

	public static User registerByPhone(String phone) {
		return new User(phone);
	}

	public static User registerByAccount(String account, String passwordHash) {
		User user = new User(account);
		user.passwordHash = passwordHash;
		user.verificationStatus = VerificationStatus.VERIFIED;
		return user;
	}

	public boolean matchesPassword(PasswordEncoder encoder, String rawPassword) {
		return passwordHash != null && encoder.matches(rawPassword, passwordHash);
	}

	public void verifyCampusIdentity(String realName, String studentNo, String college, String grade) {
		this.realName = realName;
		this.studentNo = studentNo;
		this.college = college;
		this.grade = grade;
		this.verificationStatus = VerificationStatus.VERIFIED;
	}

	public void updateProfile(String nickname, String avatarUrl) {
		this.nickname = nickname;
		this.avatarUrl = avatarUrl;
	}

	public void blacklist(String reason, OffsetDateTime expireAt) {
		this.blacklistReason = reason;
		this.blacklistExpireAt = expireAt;
		this.verificationStatus = VerificationStatus.BLACKLISTED;
	}

	public void removeBlacklist() {
		this.blacklistReason = null;
		this.blacklistExpireAt = null;
		this.verificationStatus = studentNo == null ? VerificationStatus.UNVERIFIED : VerificationStatus.VERIFIED;
	}

	public boolean isBlacklisted() {
		return verificationStatus == VerificationStatus.BLACKLISTED
				&& (blacklistExpireAt == null || blacklistExpireAt.isAfter(OffsetDateTime.now()));
	}

	@PrePersist
	void prePersist() {
		OffsetDateTime now = OffsetDateTime.now();
		this.createdAt = now;
		this.updatedAt = now;
	}

	@PreUpdate
	void preUpdate() {
		this.updatedAt = OffsetDateTime.now();
	}

	public Long getId() {
		return id;
	}

	public String getPhone() {
		return phone;
	}

	public String getNickname() {
		return nickname;
	}

	public String getAvatarUrl() {
		return avatarUrl;
	}

	public UserRole getRole() {
		return role;
	}

	public VerificationStatus getVerificationStatus() {
		return verificationStatus;
	}

	public String getRealName() {
		return realName;
	}

	public String getStudentNo() {
		return studentNo;
	}

	public String getCollege() {
		return college;
	}

	public String getGrade() {
		return grade;
	}

	public String getBlacklistReason() {
		return blacklistReason;
	}

	public OffsetDateTime getBlacklistExpireAt() {
		return blacklistExpireAt;
	}

	public OffsetDateTime getCreatedAt() {
		return createdAt;
	}

	public OffsetDateTime getUpdatedAt() {
		return updatedAt;
	}
}
