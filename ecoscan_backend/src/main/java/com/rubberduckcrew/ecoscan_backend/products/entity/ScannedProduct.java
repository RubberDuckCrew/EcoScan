package com.rubberduckcrew.ecoscan_backend.products.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class ScannedProduct extends Product {
    @PositiveOrZero private int score;
    @PositiveOrZero private int environmentScore;
    @PositiveOrZero private int socialScore;
    @PositiveOrZero private int healthScore;

    @NotNull @Size(max = 2048) @Column(length = 2048)
    private String justification;

    @NotNull
    private LocalDateTime scannedDate;
}
