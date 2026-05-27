package com.rubberduckcrew.ecoscan_backend.user.entity;

import com.rubberduckcrew.ecoscan_backend.common.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "users")
public class User extends BaseEntity {
}
