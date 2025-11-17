import { Service } from "diod";

import { ProductReview } from "../../domain/ProductReview";
import { ProductReviewRepository } from "../../domain/ProductReviewRepository";

@Service()
export class ProductReviewCreator {
	constructor(private readonly repository: ProductReviewRepository) {}

	async create(
		id: string,
		userId: string,
		productId: string,
		rating: number,
		comment: string,
	): Promise<void> {
		const product = ProductReview.create(
			id,
			userId,
			productId,
			rating,
			comment,
		);

		await this.repository.save(product);
	}
}
