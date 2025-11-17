/* eslint-disable no-console */
import "reflect-metadata";

import { container } from "../../contexts/shared/infrastructure/dependency-injection/diod.config";
import { PostgresEventBus } from "../../contexts/shared/infrastructure/domain-event/PostgresEventBus";
import { PostgresConnection } from "../../contexts/shared/infrastructure/postgres/PostgresConnection";

async function main(eventBus: PostgresEventBus, limit: number): Promise<void> {
	console.log(`🚀 Starting PostgreSQL event consumer...\n`);
	console.log(`📊 Event consumption limit: ${limit}\n`);

	await eventBus.consume(limit);

	console.log(`\n✨ Consumption process finished`);
}

const limit = process.argv[2] ? parseInt(process.argv[2], 10) : 10;

main(container.get(PostgresEventBus), limit)
	.catch((error) => {
		console.error("❌ Error during event consumption:", error);
		process.exit(1);
	})
	.finally(async () => {
		await container.get(PostgresConnection).end();
		console.log("\n🔌 Connection closed");
		process.exit(0);
	});
