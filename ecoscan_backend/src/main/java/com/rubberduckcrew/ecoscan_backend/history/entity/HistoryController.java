package com.rubberduckcrew.ecoscan_backend.history.entity;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("history")
@RequiredArgsConstructor
public class HistoryController {
    @GetMapping
    public String test() {
        return "Hello World";
    }
}
