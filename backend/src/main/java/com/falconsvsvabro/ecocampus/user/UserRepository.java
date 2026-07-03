package com.falconsvsvabro.ecocampus.user;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByPhone(String phone);

	boolean existsByStudentNoAndIdNot(String studentNo, Long id);

	@Query("""
			select account from User account
			where (:verificationStatus is null or account.verificationStatus = :verificationStatus)
			  and (:keyword is null or lower(account.nickname) like lower(concat('%', :keyword, '%'))
			    or account.phone like concat('%', :keyword, '%')
			    or account.studentNo like concat('%', :keyword, '%'))
			order by account.createdAt desc
			""")
	Page<User> searchAdminUsers(@Param("keyword") String keyword,
			@Param("verificationStatus") VerificationStatus verificationStatus, Pageable pageable);
}
