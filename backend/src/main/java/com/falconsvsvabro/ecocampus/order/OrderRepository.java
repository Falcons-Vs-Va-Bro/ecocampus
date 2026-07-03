package com.falconsvsvabro.ecocampus.order;

import java.util.Collection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<TradeOrder, Long> {

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
}
