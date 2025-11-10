import { ProductId } from "../../products/domain/ProductId";

import { ProductReview } from "./ProductReview";

export abstract class ProductReviewRepository {
	abstract save(review: ProductReview): Promise<void>;

	abstract searchByProduct(productId: ProductId): Promise<ProductReview[]>;
}
