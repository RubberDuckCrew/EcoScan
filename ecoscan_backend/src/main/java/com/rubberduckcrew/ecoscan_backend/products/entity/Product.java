package com.rubberduckcrew.ecoscan_backend.products.entity;

import com.rubberduckcrew.ecoscan_backend.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Product extends BaseEntity {
    @NotBlank @Column(nullable = false)
    private String name;

    @NotBlank @Column(unique = true, nullable = false)
    private String barcode;

    @NotNull @Size(max = 2048) @Column(length = 2048, nullable = false)
    private String description;
}
