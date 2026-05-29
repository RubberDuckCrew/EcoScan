package com.rubberduckcrew.ecoscan_backend.products.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.io.Serial;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class ScannedProduct extends Product {
    @Serial
    private static final long serialVersionUID = 1L;

    @PositiveOrZero @Column
    private int score;

    @PositiveOrZero @Column
    private int environmentScore;

    @PositiveOrZero @Column
    private int socialScore;

    @PositiveOrZero @Column
    private int healthScore;

    @Size(max = 2048) @Column(length = 2048)
    private String justification;

    private LocalDateTime scannedDate;
}
