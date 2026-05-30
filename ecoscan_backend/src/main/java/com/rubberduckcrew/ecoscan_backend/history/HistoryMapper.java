package com.rubberduckcrew.ecoscan_backend.history;

import com.rubberduckcrew.ecoscan_backend.history.dto.ScanHistoryDTO;
import com.rubberduckcrew.ecoscan_backend.history.entity.ScanHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface HistoryMapper {
    @Mapping(target = "id")
    @Mapping(target = ".", source = "product")
    @Mapping(target = "productId", source = "product.id")
    ScanHistoryDTO toDTO(ScanHistory scanHistory);
}
