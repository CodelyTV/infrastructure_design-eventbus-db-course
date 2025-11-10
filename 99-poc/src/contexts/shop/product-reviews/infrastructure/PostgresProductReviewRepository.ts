import { Service } from "diod";
import postgres from "postgres";

import { PostgresConnection } from "../../../shared/infrastructure/postgres/PostgresConnection";
import { ProductId } from "../../products/domain/ProductId";
import { ProductReview } from "../domain/ProductReview";
import { ProductReviewRepository } from "../domain/ProductReviewRepository";

type DatabaseProductReviewRow = {
	id: string;
	user_id: string;
	product_id: string;
	rating: number;
	comment: string;
};

@Service()
export class PostgresProductReviewRepository
	implements ProductReviewRepository
{
	private readonly sql: postgres.Sql;

	constructor(connection: PostgresConnection) {
		this.sql = connection.sql;
	}

	async save(review: ProductReview): Promise<void> {
		await this.sql`
			INSERT INTO shop.product_reviews (id, user_id, product_id, rating, comment, is_featured)
			VALUES (
				${review.id.value},
				${review.userId.value},
				${review.productId.value},
				${review.rating.value},
				${review.comment.value},
				false
			);
		`;
	}

	async searchByProduct(productId: ProductId): Promise<ProductReview[]> {
		const result = await this.sql<DatabaseProductReviewRow[]>`
			SELECT
				id,
				user_id,
				product_id,
				rating,
				comment
			FROM shop.product_reviews
			WHERE product_id = ${productId.value};
		`;

		return result.map((row) => this.toProductReview(row));
	}

	private toProductReview(row: DatabaseProductReviewRow): ProductReview {
		return new ProductReview(
			row.id,
			row.user_id,
			row.product_id,
			row.rating,
			row.comment,
		);
	}
}
