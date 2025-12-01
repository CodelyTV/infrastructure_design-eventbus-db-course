/* eslint-disable no-console,no-await-in-loop */
import "reflect-metadata";

import { container } from "../../contexts/shared/infrastructure/dependency-injection/diod.config";
import { PostgresConnection } from "../../contexts/shared/infrastructure/postgres/PostgresConnection";

interface EventStats {
	total: number;
	deadLetter: number;
	inRetry: number;
	oldestEventAge: string | null;
}

async function getEventStats(
	connection: PostgresConnection,
): Promise<EventStats> {
	const result = await connection.sql<
		{
			total: number;
			dead_letter: number;
			in_retry: number;
			oldest_age: string | null;
		}[]
	>`
		SELECT
			COUNT(*)::int as total,
			COUNT(*) FILTER (WHERE is_in_dead_letter = true)::int as dead_letter,
			COUNT(*) FILTER (WHERE retries > 0 AND is_in_dead_letter = false)::int as in_retry,
			CASE
				WHEN COUNT(*) > 0 THEN
					NOW() - MIN(inserted_at)
				ELSE NULL
			END as oldest_age
		FROM public.domain_events_to_consume
	`;

	return {
		total: result[0].total,
		deadLetter: result[0].dead_letter,
		inRetry: result[0].in_retry,
		oldestEventAge: result[0].oldest_age,
	};
}

function formatDuration(interval: string | null): string {
	if (!interval) {
		return "N/A";
	}

	return interval;
}

function printStats(stats: EventStats): void {
	console.clear();
	console.log(`📊 EVENT BUS MONITOR`);
	console.log(`─────────────────────────────────────`);
	console.log(`📦 Total events:    ${stats.total}`);
	console.log(`💀 Dead letter:     ${stats.deadLetter}`);
	console.log(`🔄 In retry:        ${stats.inRetry}`);
	console.log(`⏰ Oldest event:    ${formatDuration(stats.oldestEventAge)}`);
	console.log(`─────────────────────────────────────`);
	console.log(`\n⏸️  Press Ctrl+C to stop`);
}

async function main(): Promise<void> {
	const connection = container.get(PostgresConnection);

	console.log(`🚀 Starting Event Bus Monitor...\n`);

	const running = { value: true };

	process.on("SIGINT", () => {
		running.value = false;
	});

	while (running.value) {
		const stats = await getEventStats(connection);
		printStats(stats);
		await new Promise((resolve) => {
			setTimeout(resolve, 1000);
		});
	}

	await connection.end();
	console.log("\n🔌 Connection closed");
}

main().catch(console.error);
