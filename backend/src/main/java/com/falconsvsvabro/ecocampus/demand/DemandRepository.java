package com.falconsvsvabro.ecocampus.demand;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DemandRepository extends JpaRepository<Demand, Long> {

	@Query("""
			select demand from Demand demand
			where demand.status = com.falconsvsvabro.ecocampus.demand.DemandStatus.OPEN
			  and (:categoryId is null or demand.categoryId = :categoryId)
			  and (:keyword is null or lower(demand.title) like lower(concat('%', :keyword, '%'))
			    or lower(demand.description) like lower(concat('%', :keyword, '%')))
			order by demand.createdAt desc
			""")
	Page<Demand> searchOpenDemands(@Param("categoryId") Long categoryId, @Param("keyword") String keyword,
			Pageable pageable);

	@Query("""
			select demand from Demand demand
			where demand.userId = :userId
			order by demand.createdAt desc
			""")
	Page<Demand> findByUserId(@Param("userId") Long userId, Pageable pageable);
}
