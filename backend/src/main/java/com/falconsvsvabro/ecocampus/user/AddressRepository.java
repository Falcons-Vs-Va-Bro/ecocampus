package com.falconsvsvabro.ecocampus.user;

import java.util.List;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AddressRepository extends JpaRepository<Address, Long> {

	List<Address> findByUserIdOrderByDefaultAddressDescIdDesc(Long userId);

	/**
	 * 悲观写锁：管理默认地址时锁定该用户已有地址，防止并发请求同时设置多个默认地址。
	 */
	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("""
			select address from Address address
			where address.userId = :userId
			order by address.defaultAddress desc, address.id desc
			""")
	List<Address> findByUserIdForUpdate(@Param("userId") Long userId);

}
