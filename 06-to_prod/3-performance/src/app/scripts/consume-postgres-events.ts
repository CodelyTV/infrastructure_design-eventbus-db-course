/* eslint-disable no-console,no-await-in-loop */
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
	batchSize: number,
): Promise<void> {
	console.log(`🚀 Starting PostgreSQL event consumer...\n`);
	console.log(
		`📋 Subscribers: ${subscribers === "*" ? "all" : subscribers.join(", ")}`,
	);
	console.log(`📊 Batch size: ${batchSize}`);
	console.log(`♾️  Running continuously until Ctrl+C\n`);

	const running = { value: true };

	process.on("SIGINT", () => {
		console.log(`\n\n⏹️  Stopping consumer...`);
		running.value = false;
	});

	while (running.value) {
		await eventBus.consume(subscribers, batchSize);
		await new Promise((resolve) => {
			setTimeout(resolve, 100);
		});
	}

	console.log(`\n✨ Consumption process finished`);
}

const subscribers = parseSubscribers(process.argv[2]);
const batchSize = process.argv[3] ? parseInt(process.argv[3], 10) : 10;

main(container.get(PostgresEventBus), subscribers, batchSize)
	.catch((error) => {
		console.error("❌ Error during event consumption:", error);
		process.exit(1);
	})
	.finally(async () => {
		await container.get(PostgresConnection).end();
		console.log("\n🔌 Connection closed");
		process.exit(0);
	});
