package com.rubberduckcrew.ecoscan_backend.products;

import com.rubberduckcrew.ecoscan_backend.food_data.FoodDataRepository;
import com.rubberduckcrew.ecoscan_backend.products.entity.Product;
import com.rubberduckcrew.ecoscan_backend.products.entity.ScannedProduct;
import com.rubberduckcrew.ecoscanai.model.GreenScoreResult;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ScannedProductRepository scannedProductRepository;
    private final ProductMapper productMapper;
	private final FoodDataRepository foodDataRepository;

    public Product getProduct(final String id) {
        return productRepository.getProductById(id).orElseThrow(() -> new
		 ResponseStatusException(HttpStatus.NOT_FOUND,
            "Product with id " + id + " not found"));
    }

	public Product getProductFromOpenFoodFacts(final String id) {
		return toProduct(foodDataRepository.getProduct(id));
	}

	public Product toProduct(Map<String, Object> json) {
		Product product = new Product();
		//TODO save 'categories' in Product-DB
		//TODO remove leading 0s
		product.setId((String) json.get("code"));
		product.setName((String) json.get("product_name"));
		//product.setImageUrl((String) json.get("imageUrl"));
//		product.setDescription((String) json.get("labels_tags"));

		Object rawLabels = json.get("labels_tags");
		if (rawLabels instanceof org.duckdb.DuckDBArray duckDbArray) {
			try {
				String[] labelsArray = (String[]) duckDbArray.getArray();
				// Hier nutzen wir jetzt ein einfaches Leerzeichen als Trenner
				product.setDescription(String.join(" ", labelsArray));
			} catch (Exception e) {
				product.setDescription("");
			}
		} else if (rawLabels instanceof String) {
			product.setDescription((String) rawLabels);
		}

		return product;
	}

	private Object cleanValue(final Object value) {
		if (value != null && !value.getClass().getPackageName().startsWith("java.lang")) {
			return value.toString();
		}
		return value;
	}
    public boolean hasProductBeenScanned(final String id) {
        return scannedProductRepository.existsById(id);
    }

    public ScannedProduct getScannedProduct(final String id) {
        return scannedProductRepository.getScannedProductById(id);
    }

    public void addScannedProduct(final String id, final GreenScoreResult greenScoreResult) {
        final Product product = getProduct(id);
        productRepository.delete(product);
        final ScannedProduct scannedProduct = productMapper.toScannedProduct(product);
        scannedProduct.setScore(greenScoreResult.getOverallScore());
        scannedProduct.setJustification(greenScoreResult.getReason());
        scannedProduct.setScannedDate(LocalDateTime.now());
        scannedProductRepository.save(scannedProduct);
    }

}
