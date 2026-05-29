package com.rubberduckcrew.ecoscan_backend.common;

import java.util.List;
import org.apache.logging.log4j.internal.annotation.SuppressFBWarnings;

@SuppressFBWarnings("EI_EXPOSE_REP")
public record SliceDTO<T>(List<T> content, boolean hasNext, int currentPage) {
}
