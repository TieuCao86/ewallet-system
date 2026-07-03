package com.ewallet.module.user.repository;

import com.ewallet.module.user.entity.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminUserRepository extends CrudRepository<User, Long> {

}
