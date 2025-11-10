import { Service } from "diod";
import postgres from "postgres";

import { PostgresConnection } from "../../../shared/infrastructure/postgres/PostgresConnection";
import { Product } from "../domain/Product";
import { ProductId } from "../domain/ProductId";
import { ProductRepository } from "../domain/ProductRepository";

type DatabaseProductRow = {
	id: string;
	name: string;
	price_amount: number;
	price_currency: "EUR" | "USD";
	image_urls: string[];
};

@Service()
export class PostgresProductRepository implements ProductRepository {
	private readonly sql: postgres.Sql;

	constructor(connection: PostgresConnection) {
		this.sql = connection.sql;
	}

	async save(product: Product): Promise<void> {
		const primitives = product.toPrimitives();

		await this.sql`
			INSERT INTO shop.products (id, name, price_amount, price_currency, image_urls, views, creation_date)
			VALUES (
				${primitives.id},
				${primitives.name},
				${primitives.price.amount},
				${primitives.price.currency},
				${this.sql.json(primitives.imageUrls)},
				0,
				NOW()
			)
			ON CONFLICT (id) DO UPDATE SET
				name = EXCLUDED.name,
				price_amount = EXCLUDED.price_amount,
				price_currency = EXCLUDED.price_currency,
				image_urls = EXCLUDED.image_urls;
		`;
	}

	async search(id: ProductId): Promise<Product | null> {
		const result = await this.sql<DatabaseProductRow[]>`
			SELECT
				id,
				name,
				price_amount,
				price_currency,
				image_urls
			FROM shop.products
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
				image_urls
			FROM shop.products;
		`;

		return result.map((row) => this.toProduct(row));
	}

	private toProduct(row: DatabaseProductRow): Product {
		return new Product(
			row.id,
			row.name,
			{
				amount: parseFloat(String(row.price_amount)),
				currency: row.price_currency,
			},
			row.image_urls,
		);
	}
}
