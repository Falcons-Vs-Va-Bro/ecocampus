package com.falconsvsvabro.ecocampus.category;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "categories")
public class Category {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 40)
	private String name;

	@Column(nullable = false)
	private int sort;

	@Column(name = "parent_id")
	private Long parentId;

	@Column(nullable = false)
	private boolean enabled;

	@Column(nullable = false)
	private OffsetDateTime createdAt;

	@Column(nullable = false)
	private OffsetDateTime updatedAt;

	protected Category() {
	}

	public Category(String name, int sort, Long parentId, boolean enabled) {
		this.name = name;
		this.sort = sort;
		this.parentId = parentId;
		this.enabled = enabled;
	}

	public void update(String name, int sort, Long parentId, boolean enabled) {
		this.name = name;
		this.sort = sort;
		this.parentId = parentId;
		this.enabled = enabled;
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

	public String getName() {
		return name;
	}

	public int getSort() {
		return sort;
	}

	public Long getParentId() {
		return parentId;
	}

	public boolean isEnabled() {
		return enabled;
	}
}
