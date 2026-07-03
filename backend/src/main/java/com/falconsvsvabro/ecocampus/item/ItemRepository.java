package com.falconsvsvabro.ecocampus.item;

import java.util.List;
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

	@Query("""
			select item from Item item
			where item.status = com.falconsvsvabro.ecocampus.item.ItemStatus.ON_SALE
			  and (:keyword is null or lower(item.title) like lower(concat('%', :keyword, '%'))
			    or lower(item.description) like lower(concat('%', :keyword, '%')))
			  and (:categoryId is null or item.categoryId = :categoryId)
			  and (:minPriceCent is null or item.priceCent >= :minPriceCent)
			  and (:maxPriceCent is null or item.priceCent <= :maxPriceCent)
			  and (:deliveryMode is null or :deliveryMode member of item.deliveryModes)
			order by item.createdAt desc
			""")
	Page<Item> searchPublicItems(@Param("keyword") String keyword, @Param("categoryId") Long categoryId,
			@Param("minPriceCent") Long minPriceCent, @Param("maxPriceCent") Long maxPriceCent,
			@Param("deliveryMode") DeliveryMode deliveryMode, Pageable pageable);

	@Query("""
			select item from Item item
			where item.status <> com.falconsvsvabro.ecocampus.item.ItemStatus.DELETED
			  and (:status is null or item.status = :status)
			  and (:keyword is null or lower(item.title) like lower(concat('%', :keyword, '%'))
			    or lower(item.description) like lower(concat('%', :keyword, '%')))
			  and (:categoryId is null or item.categoryId = :categoryId)
			order by item.createdAt desc
			""")
	Page<Item> searchAdminItems(@Param("status") ItemStatus status, @Param("keyword") String keyword,
			@Param("categoryId") Long categoryId, Pageable pageable);

	@Query("""
			select item from Item item
			where item.status = com.falconsvsvabro.ecocampus.item.ItemStatus.ON_SALE
			  and item.categoryId = :categoryId
			  and (:budgetMinCent is null or item.priceCent >= :budgetMinCent)
			  and (:budgetMaxCent is null or item.priceCent <= :budgetMaxCent)
			order by item.createdAt desc
			""")
	List<Item> findOnSaleCandidatesForDemand(@Param("categoryId") Long categoryId,
			@Param("budgetMinCent") Long budgetMinCent, @Param("budgetMaxCent") Long budgetMaxCent);

	long countByStatus(ItemStatus status);

	long countByStatusNot(ItemStatus status);

	long countByCategoryIdAndStatusNot(Long categoryId, ItemStatus status);
}
