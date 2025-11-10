import { Service } from "diod";

import { ShopUserFinder } from "../../../shop-user/application/find/ShopUserFinder";
import { ProductReview } from "../../domain/ProductReview";
import { ProductReviewRepository } from "../../domain/ProductReviewRepository";

@Service()
export class ProductReviewCreator {
	constructor(
		private readonly repository: ProductReviewRepository,
		private readonly userFinder: ShopUserFinder,
	) {}

	async create(
		id: string,
		userId: string,
		productId: string,
		rating: number,
		comment: string,
	): Promise<void> {
		const user = await this.userFinder.find(userId);

		const product = ProductReview.create(
			id,
			userId,
			productId,
			rating,
			comment,
			user.name,
			user.profilePicture,
		);

		await this.repository.save(product);
	}
}
