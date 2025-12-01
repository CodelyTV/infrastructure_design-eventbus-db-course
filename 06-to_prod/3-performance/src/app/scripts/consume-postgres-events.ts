/* eslint-disable no-console */
import "reflect-metadata";

import { container } from "../../contexts/shared/infrastructure/dependency-injection/diod.config";
import { PostgresEventBus } from "../../contexts/shared/infrastructure/domain-event/PostgresEventBus";
import { PostgresConnection } from "../../contexts/shared/infrastructure/postgres/PostgresConnection";

function parseSubscribers(subscribers: string | undefined): string[] | "*" {
	if (!subscribers || subscribers === "*") {
		return "*";
	}

	return subscribers.split(",").map((subscriber) => subscriber.trim());
}

async function main(
	eventBus: PostgresEventBus,
	subscribers: string[] | "*",
	limit: number,
): Promise<void> {
	console.log(`🚀 Starting PostgreSQL event consumer...\n`);
	console.log(
		`📋 Subscribers: ${subscribers === "*" ? "all" : subscribers.join(", ")}`,
	);
	console.log(`📊 Limit: ${limit}\n`);

	await eventBus.consume(subscribers, limit);

	console.log(`\n✨ Consumption process finished`);
}

const subscribers = parseSubscribers(process.argv[2]);
const limit = process.argv[3] ? parseInt(process.argv[3], 10) : 10;

main(container.get(PostgresEventBus), subscribers, limit)
	.catch((error) => {
		console.error("❌ Error during event consumption:", error);
		process.exit(1);
	})
	.finally(async () => {
		await container.get(PostgresConnection).end();
		console.log("\n🔌 Connection closed");
		process.exit(0);
	});
