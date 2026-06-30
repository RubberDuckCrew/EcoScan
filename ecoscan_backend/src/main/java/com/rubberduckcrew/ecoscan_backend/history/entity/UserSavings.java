package com.rubberduckcrew.ecoscan_backend.history.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class UserSavings implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Column(name = "id", length = 36)
    @Id
    private UUID id;

    @NotNull private BigDecimal co2Saving;
    @NotNull private Integer carRideEquivalent;
}
