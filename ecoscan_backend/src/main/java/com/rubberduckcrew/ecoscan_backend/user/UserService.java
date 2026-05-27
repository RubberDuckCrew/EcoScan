package com.rubberduckcrew.ecoscan_backend.user;

import com.rubberduckcrew.ecoscan_backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public User registerUser() {
        return userRepository.save(new User());
    }
}
