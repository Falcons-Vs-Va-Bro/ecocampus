package com.falconsvsvabro.ecocampus.category;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {

	List<Category> findByOrderBySortAscIdAsc();

	boolean existsByNameAndIdNot(String name, Long id);
}
