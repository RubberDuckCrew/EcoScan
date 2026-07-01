package com.rubberduckcrew.ecoscan_backend.history;

import com.rubberduckcrew.ecoscan_backend.history.dto.SavingsResultDTO;
import com.rubberduckcrew.ecoscan_backend.history.entity.UserSavings;
import java.util.UUID;
import org.mapstruct.Mapper;

@Mapper
public interface SavingsMapper {
    SavingsResultDTO toDTO(UserSavings userSavings);

    UserSavings toEntity(SavingsResultDTO savingsResultDTO, UUID id);
}
