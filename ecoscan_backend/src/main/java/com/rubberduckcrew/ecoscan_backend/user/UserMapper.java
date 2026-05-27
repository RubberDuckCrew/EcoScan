package com.rubberduckcrew.ecoscan_backend.user;

import com.rubberduckcrew.ecoscan_backend.user.dto.UserDTO;
import com.rubberduckcrew.ecoscan_backend.user.entity.User;
import org.mapstruct.Mapper;

@Mapper
public interface UserMapper {
    UserDTO toUserDTO(User user);
}
