package com.falconsvsvabro.ecocampus.demand;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "demands")
public class Demand {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private Long userId;

	@Column(nullable = false, length = 80)
	private String title;

	@Column(nullable = false, length = 1000)
	private String description;

	@Column(nullable = false)
	private Long categoryId;

	private Long budgetMinCent;

	private Long budgetMaxCent;

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "demand_keywords", joinColumns = @JoinColumn(name = "demand_id"))
	@Column(name = "keyword", nullable = false, length = 40)
	private List<String> keywords = new ArrayList<>();

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private DemandStatus status;

	@Column(nullable = false)
	private OffsetDateTime createdAt;

	@Column(nullable = false)
	private OffsetDateTime updatedAt;

	protected Demand() {
	}

	public Demand(Long userId, String title, String description, Long categoryId, Long budgetMinCent,
			Long budgetMaxCent, List<String> keywords) {
		this.userId = userId;
		this.title = title;
		this.description = description;
		this.categoryId = categoryId;
		this.budgetMinCent = budgetMinCent;
		this.budgetMaxCent = budgetMaxCent;
		this.keywords = new ArrayList<>(keywords);
		this.status = DemandStatus.OPEN;
	}

	public void close() {
		if (status == DemandStatus.CLOSED) {
			throw new IllegalStateException("demand already closed");
		}
		this.status = DemandStatus.CLOSED;
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

	public Long getUserId() {
		return userId;
	}

	public String getTitle() {
		return title;
	}

	public String getDescription() {
		return description;
	}

	public Long getCategoryId() {
		return categoryId;
	}

	public Long getBudgetMinCent() {
		return budgetMinCent;
	}

	public Long getBudgetMaxCent() {
		return budgetMaxCent;
	}

	public List<String> getKeywords() {
		return List.copyOf(keywords);
	}

	public DemandStatus getStatus() {
		return status;
	}

	public OffsetDateTime getCreatedAt() {
		return createdAt;
	}
}
