package com.rubberduckcrew.ecoscan_backend.history;

import com.rubberduckcrew.ecoscan_backend.history.entity.UserSavings;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;

public interface SavingsRepository extends CrudRepository<UserSavings, UUID> {
}
