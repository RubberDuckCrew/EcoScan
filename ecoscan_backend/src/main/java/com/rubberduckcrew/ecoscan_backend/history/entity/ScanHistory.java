package com.rubberduckcrew.ecoscan_backend.history.entity;

import com.rubberduckcrew.ecoscan_backend.common.BaseEntity;
import com.rubberduckcrew.ecoscan_backend.products.entity.ScannedProduct;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import java.io.Serial;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(indexes = @Index(name = "idx_scan_history_user_id", columnList = "user_id"))
@Getter
@Setter
@NoArgsConstructor
public class ScanHistory extends BaseEntity {
    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull private UUID userId;

    @ManyToOne
    @NotNull private ScannedProduct product;

    @NotNull private LocalDateTime savedDate;
}
