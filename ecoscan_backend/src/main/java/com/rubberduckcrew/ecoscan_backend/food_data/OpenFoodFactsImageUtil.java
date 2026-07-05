package com.rubberduckcrew.ecoscan_backend.food_data;

public final class OpenFoodFactsImageUtil {
    private static final String BASE_URL = "https://images.openfoodfacts.org/images/products/";

    private OpenFoodFactsImageUtil() {
    }

    public static String getFrontImageUrl(final String barcode) {
        if (barcode == null || barcode.isBlank() || barcode.length() > 13) {
            return null;
        }
        final String digits = "0".repeat(13 - barcode.length()) + barcode;
        return BASE_URL
            + digits.substring(0, 3) + "/"
            + digits.substring(3, 6) + "/"
            + digits.substring(6, 9) + "/"
            + digits.substring(9)
            + "/1.400.jpg";
    }
}
