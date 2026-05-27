package com.rubberduckcrew.ecoscan_backend.user;

import com.rubberduckcrew.ecoscan_backend.user.entity.User;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;

public interface UserRepository extends CrudRepository<User, UUID> {
}
