import { Service } from "diod";
import postgres from "postgres";

import { PostgresConnection } from "../../../shared/infrastructure/postgres/PostgresConnection";
import { Product } from "../domain/Product";
import { ProductFeaturedReviewPrimitives } from "../domain/ProductFeaturedReview";
import { ProductId } from "../domain/ProductId";
import { ProductRepository } from "../domain/ProductRepository";

type DatabaseProductRow = {
	id: string;
	name: string;
	price_amount: number;
	price_currency: "EUR" | "USD";
	image_urls: string[];
	featured_review: ProductFeaturedReviewPrimitives | null;
	rating: number;
};

@Service()
export class PostgresProductRepository implements ProductRepository {
	private readonly sql: postgres.Sql;

	constructor(connection: PostgresConnection) {
		this.sql = connection.sql;
	}

	async search(id: ProductId): Promise<Product | null> {
		const result = await this.sql<DatabaseProductRow[]>`
			SELECT
				id,
				name,
				price_amount,
				price_currency,
				image_urls,
				featured_review,
				rating
			FROM shop.products_view
			WHERE id = ${id.value};
		`;

		return result.length ? this.toProduct(result[0]) : null;
	}

	async searchAll(): Promise<Product[]> {
		const result = await this.sql<DatabaseProductRow[]>`
			SELECT
				id,
				name,
				price_amount,
				price_currency,
				image_urls,
				featured_review,
				rating
			FROM shop.products_view;
		`;

		return result.map((row) => this.toProduct(row));
	}

	private toProduct(row: DatabaseProductRow): Product {
		return new Product(
			row.id,
			row.name,
			{
				amount: row.price_amount,
				currency: row.price_currency,
			},
			row.image_urls,
			row.featured_review,
			row.rating,
		);
	}
}
