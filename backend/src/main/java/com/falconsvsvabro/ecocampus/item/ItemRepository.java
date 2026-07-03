package com.falconsvsvabro.ecocampus.item;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ItemRepository extends JpaRepository<Item, Long> {

	@Query("""
			select item from Item item
			where item.sellerId = :sellerId
			  and item.status <> com.falconsvsvabro.ecocampus.item.ItemStatus.DELETED
			  and (:status is null or item.status = :status)
			order by item.createdAt desc
			""")
	Page<Item> findSellerItems(@Param("sellerId") Long sellerId, @Param("status") ItemStatus status, Pageable pageable);
}
