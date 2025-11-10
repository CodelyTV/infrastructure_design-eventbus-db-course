import { ProductId } from "../../products/domain/ProductId";
import { ShopUserId } from "../../shop-user/domain/ShopUserId";
import { ShopUserName } from "../../shop-user/domain/ShopUserName";
import { ShopUserProfilePicture } from "../../shop-user/domain/ShopUserProfilePicture";

import { ProductReviewComment } from "./ProductReviewComment";
import { ProductReviewId } from "./ProductReviewId";
import { ProductReviewRating } from "./ProductReviewRating";

export type ProductReviewPrimitives = {
	id: string;
	userId: string;
	productId: string;
	rating: number;
	comment: string;
	userName: string;
	userProfilePicture: string;
};

export class ProductReview {
	public readonly id: ProductReviewId;
	public readonly userId: ShopUserId;
	public readonly productId: ProductId;
	public readonly rating: ProductReviewRating;
	public readonly comment: ProductReviewComment;
	public readonly userName: ShopUserName;
	public readonly userProfilePicture: ShopUserProfilePicture;

	constructor(
		id: string,
		userId: string,
		productId: string,
		rating: number,
		comment: string,
		userName: string,
		userProfilePicture: string,
	) {
		this.id = new ProductReviewId(id);
		this.userId = new ShopUserId(userId);
		this.productId = new ProductId(productId);
		this.rating = new ProductReviewRating(rating);
		this.comment = new ProductReviewComment(comment);
		this.userName = new ShopUserName(userName);
		this.userProfilePicture = new ShopUserProfilePicture(
			userProfilePicture,
		);
	}

	static create(
		id: string,
		userId: string,
		productId: string,
		rating: number,
		comment: string,
		userName: string,
		userProfilePicture: string,
	): ProductReview {
		return new ProductReview(
			id,
			userId,
			productId,
			rating,
			comment,
			userName,
			userProfilePicture,
		);
	}

	toPrimitives(): ProductReviewPrimitives {
		return {
			id: this.id.value,
			userId: this.userId.value,
			productId: this.productId.value,
			rating: this.rating.value,
			comment: this.comment.value,
			userName: this.userName.value,
			userProfilePicture: this.userProfilePicture.value,
		};
	}
}
