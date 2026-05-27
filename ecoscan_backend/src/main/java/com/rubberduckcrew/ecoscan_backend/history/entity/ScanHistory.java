package com.rubberduckcrew.ecoscan_backend.history.entity;

import com.rubberduckcrew.ecoscan_backend.common.BaseEntity;
import com.rubberduckcrew.ecoscan_backend.products.entity.Product;
import com.rubberduckcrew.ecoscan_backend.user.entity.User;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class ScanHistory extends BaseEntity {
    @ManyToOne @NotNull
    private User user;

    @ManyToOne @NotNull
    private Product product;

    @NotNull
    private LocalDateTime scannedAt = LocalDateTime.now();
}
