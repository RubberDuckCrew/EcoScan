package com.rubberduckcrew.ecoscan_backend.common;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import java.util.List;

@SuppressFBWarnings("EI_EXPOSE_REP")
public record SliceDTO<T>(List<T> content, boolean hasNext, int currentPage) {
}
