package com.rubberduckcrew.ecoscan_backend.user;

import com.rubberduckcrew.ecoscan_backend.user.dto.UserDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final UserMapper userMapper;

    @PostMapping("register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserDTO registerUser() {
        return userMapper.toUserDTO(userService.registerUser());
    }

    @GetMapping
    public String test() {
        return "Hello World";
    }
}
