import { ProductId } from "../../products/domain/ProductId";
import { ShopUserId } from "../../shop-user/domain/ShopUserId";

import { ProductReviewComment } from "./ProductReviewComment";
import { ProductReviewId } from "./ProductReviewId";
import { ProductReviewRating } from "./ProductReviewRating";

export type ProductReviewPrimitives = {
	id: string;
	userId: string;
	productId: string;
	rating: number;
	comment: string;
};

export class ProductReview {
	public readonly id: ProductReviewId;
	public readonly userId: ShopUserId;
	public readonly productId: ProductId;
	public readonly rating: ProductReviewRating;
	public readonly comment: ProductReviewComment;

	constructor(
		id: string,
		userId: string,
		productId: string,
		rating: number,
		comment: string,
	) {
		this.id = new ProductReviewId(id);
		this.userId = new ShopUserId(userId);
		this.productId = new ProductId(productId);
		this.rating = new ProductReviewRating(rating);
		this.comment = new ProductReviewComment(comment);
	}

	static create(
		id: string,
		userId: string,
		productId: string,
		rating: number,
		comment: string,
	): ProductReview {
		return new ProductReview(id, userId, productId, rating, comment);
	}

	toPrimitives(): ProductReviewPrimitives {
		return {
			id: this.id.value,
			userId: this.userId.value,
			productId: this.productId.value,
			rating: this.rating.value,
			comment: this.comment.value,
		};
	}
}
