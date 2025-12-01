/* eslint-disable no-console,no-await-in-loop */
import { faker } from "@faker-js/faker";

const DEFAULT_CONCURRENCY = 50;
const DEFAULT_URL = "http://localhost:3000";

interface Stats {
	total: number;
	success: number;
	errors: number;
	latencies: number[];
	startTime: number;
}

function parseArgs(): { concurrency: number; baseUrl: string } {
	const args = process.argv.slice(2);
	let concurrency = DEFAULT_CONCURRENCY;
	let baseUrl = DEFAULT_URL;

	for (let i = 0; i < args.length; i++) {
		if (args[i] === "-c" || args[i] === "--concurrency") {
			concurrency = parseInt(args[i + 1], 10);
			i++;
		} else if (args[i] === "-u" || args[i] === "--url") {
			baseUrl = args[i + 1];
			i++;
		}
	}

	return { concurrency, baseUrl };
}

function percentile(arr: number[], p: number): number {
	if (arr.length === 0) {
		return 0;
	}
	const sorted = [...arr].sort((a, b) => a - b);
	const index = Math.ceil((p / 100) * sorted.length) - 1;

	return sorted[Math.max(0, index)];
}

async function createUser(
	baseUrl: string,
): Promise<{ success: boolean; latency: number }> {
	const id = crypto.randomUUID();
	const start = performance.now();

	try {
		const response = await fetch(`${baseUrl}/api/mooc/users/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: faker.person.fullName(),
				bio: faker.lorem.sentence(),
				email: faker.internet.email(),
			}),
		});

		const latency = performance.now() - start;

		return { success: response.status === 201, latency };
	} catch {
		return { success: false, latency: performance.now() - start };
	}
}

function printStats(stats: Stats, final = false): void {
	const elapsed = (Date.now() - stats.startTime) / 1000;
	const rps = stats.total / elapsed;

	const p50 = percentile(stats.latencies, 50);
	const p95 = percentile(stats.latencies, 95);
	const p99 = percentile(stats.latencies, 99);

	const prefix = final ? "\n📊 FINAL SUMMARY" : "📈";

	console.clear();
	console.log(`${prefix}`);
	console.log(`─────────────────────────────────────`);
	console.log(`⏱️  Time:    ${elapsed.toFixed(1)}s`);
	console.log(`📤 Total:   ${stats.total} requests`);
	console.log(
		`✅ Success: ${stats.success} (${((stats.success / stats.total) * 100).toFixed(1)}%)`,
	);
	console.log(`❌ Errors:  ${stats.errors}`);
	console.log(`🚀 RPS:     ${rps.toFixed(1)} req/s`);
	console.log(`─────────────────────────────────────`);
	console.log(`📊 Latencies:`);
	console.log(`   p50: ${p50.toFixed(0)}ms`);
	console.log(`   p95: ${p95.toFixed(0)}ms`);
	console.log(`   p99: ${p99.toFixed(0)}ms`);
	console.log(`─────────────────────────────────────`);

	if (!final) {
		console.log(`\n⏸️  Press Ctrl+C to stop`);
	}
}

async function runWorker(
	baseUrl: string,
	stats: Stats,
	running: { value: boolean },
): Promise<void> {
	while (running.value) {
		const result = await createUser(baseUrl);
		stats.total++;
		if (result.success) {
			stats.success++;
		} else {
			stats.errors++;
		}
		stats.latencies.push(result.latency);

		if (stats.latencies.length > 10000) {
			stats.latencies = stats.latencies.slice(-5000);
		}
	}
}

async function main(): Promise<void> {
	const { concurrency, baseUrl } = parseArgs();

	console.log(`🚀 Stress Test - Event Bus Performance`);
	console.log(`   URL: ${baseUrl}`);
	console.log(`   Concurrency: ${concurrency}`);
	console.log(`   Starting...\n`);

	const stats: Stats = {
		total: 0,
		success: 0,
		errors: 0,
		latencies: [],
		startTime: Date.now(),
	};

	const running = { value: true };

	process.on("SIGINT", () => {
		running.value = false;
		printStats(stats, true);
		process.exit(0);
	});

	const statsInterval = setInterval(() => {
		if (stats.total > 0) {
			printStats(stats);
		}
	}, 1000);

	const workers = Array.from({ length: concurrency }, () =>
		runWorker(baseUrl, stats, running),
	);

	await Promise.all(workers);

	clearInterval(statsInterval);
}

main().catch(console.error);
