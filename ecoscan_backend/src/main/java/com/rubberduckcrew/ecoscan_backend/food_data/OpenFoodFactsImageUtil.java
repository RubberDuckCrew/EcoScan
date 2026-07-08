package com.rubberduckcrew.ecoscan_backend.food_data;

import org.duckdb.DuckDBArray;
import org.duckdb.DuckDBStruct;

public final class OpenFoodFactsImageUtil {
    private static final String BASE_URL = "https://images.openfoodfacts.org/images/products/";
    private static final String FRONT_DE = "front_de";

    private OpenFoodFactsImageUtil() {
    }

    public static String getFrontImageUrl(final String barcode, final DuckDBArray imageArray) {
        if (barcode == null || barcode.isBlank() || barcode.length() > 13 || imageArray == null) {
            return "";
        }
        final String imageIdentifier = getImageIdentifier(imageArray);
        if (imageIdentifier == null) {
            return "";
        }
        final String digits = "0".repeat(13 - barcode.length()) + barcode;
        return BASE_URL
            + digits.substring(0, 3) + "/"
            + digits.substring(3, 6) + "/"
            + digits.substring(6, 9) + "/"
            + digits.substring(9) + "/"
            + imageIdentifier + ".400.jpg";
    }

    private static String getImageIdentifier(final DuckDBArray imageArray) {
        String imageIdentifier = "1";
        try {
            final DuckDBStruct[] images = (DuckDBStruct[]) imageArray.getArray();
            boolean unchanged = true;
            for (final DuckDBStruct image : images) {
                final String key = (String) image.getMap().get("key");
                if (FRONT_DE.equals(key)) {
                    final int rev = (int) image.getMap().get("rev");
                    imageIdentifier = key + "." + rev;
                    break;
                }
                if (unchanged && key.startsWith("front")) {
                    final int rev = (int) image.getMap().get("rev");
                    imageIdentifier = key + "." + rev;
                    unchanged = false;
                }
            }
        } catch (Exception e) {
            return null;
        }
        return imageIdentifier;
    }
}
