package com.rubberduckcrew.ecoscan_backend.savings;

import com.rubberduckcrew.ecoscan_backend.utils.AuthUtils;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/savings")
public class SavingsController {
    private final SavingsService savingsService;

    @GetMapping
    @Validated
    public UUID getSavings() {
        final UUID userId = AuthUtils.getSub();
        return savingsService.getSavings(userId);
    }
}
