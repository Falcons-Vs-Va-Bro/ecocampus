package com.falconsvsvabro.ecocampus.favorite;

import com.falconsvsvabro.ecocampus.item.Item;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

	boolean existsByUserIdAndItemId(Long userId, Long itemId);

	long countByItemId(Long itemId);

	Optional<Favorite> findByUserIdAndItemId(Long userId, Long itemId);

	@Query("""
			select item from Item item
			join Favorite favorite on favorite.itemId = item.id
			where favorite.userId = :userId
			  and item.status = com.falconsvsvabro.ecocampus.item.ItemStatus.ON_SALE
			order by favorite.createdAt desc
			""")
	Page<Item> findFavoriteItems(@Param("userId") Long userId, Pageable pageable);
}
