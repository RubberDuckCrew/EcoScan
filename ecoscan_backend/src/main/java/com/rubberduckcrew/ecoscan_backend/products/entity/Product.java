package com.rubberduckcrew.ecoscan_backend.products.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serial;
import java.io.Serializable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Product implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @NotNull @NotBlank private String name;

    @NotNull private String imageUrl;

    @NotNull @Size(max = 2048) @Column(length = 2048, nullable = false)
    private String description;

    @NotNull private String categories;

    @NotNull private String data;
}
