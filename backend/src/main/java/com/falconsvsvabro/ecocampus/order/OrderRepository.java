package com.falconsvsvabro.ecocampus.order;

import java.util.Collection;
import java.util.Optional;
import java.time.OffsetDateTime;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<TradeOrder, Long> {

	/**
	 * 悲观写锁：锁定订单行，防止买卖双方同时取消、确认自提或确认完成。
	 */
	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select tradeOrder from TradeOrder tradeOrder where tradeOrder.id = :id")
	Optional<TradeOrder> findByIdForUpdate(@Param("id") Long id);

	boolean existsByItemIdAndStatusIn(Long itemId, Collection<OrderStatus> statuses);

	@Query("""
			select tradeOrder from TradeOrder tradeOrder
			where tradeOrder.buyerId = :buyerId
			  and (:status is null or tradeOrder.status = :status)
			order by tradeOrder.createdAt desc
			""")
	Page<TradeOrder> findBuyerOrders(@Param("buyerId") Long buyerId, @Param("status") OrderStatus status,
			Pageable pageable);

	@Query("""
			select tradeOrder from TradeOrder tradeOrder
			where tradeOrder.sellerId = :sellerId
			  and (:status is null or tradeOrder.status = :status)
			order by tradeOrder.createdAt desc
			""")
	Page<TradeOrder> findSellerOrders(@Param("sellerId") Long sellerId, @Param("status") OrderStatus status,
			Pageable pageable);

	long countByStatus(OrderStatus status);

	long countByStatusAndCreatedAtBetween(OrderStatus status, OffsetDateTime start, OffsetDateTime end);

	@Query("""
			select count(tradeOrder) from TradeOrder tradeOrder
			join Item item on item.id = tradeOrder.itemId
			where tradeOrder.status = com.falconsvsvabro.ecocampus.order.OrderStatus.COMPLETED
			  and item.categoryId = :categoryId
			""")
	long countCompletedOrdersByCategoryId(@Param("categoryId") Long categoryId);
}
