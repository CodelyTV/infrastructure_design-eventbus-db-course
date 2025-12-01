/* eslint-disable no-console,no-await-in-loop */
import "reflect-metadata";

import { DomainEvent } from "../../contexts/shared/domain/event/DomainEvent";
import { DomainEventSubscriber } from "../../contexts/shared/domain/event/DomainEventSubscriber";
import { container } from "../../contexts/shared/infrastructure/dependency-injection/diod.config";
import { DomainEventSubscriberNameToEventNames } from "../../contexts/shared/infrastructure/domain-event/DomainEventSubscriberNameToEventNames";
import { PostgresConnection } from "../../contexts/shared/infrastructure/postgres/PostgresConnection";

async function main(): Promise<void> {
	const connection = container.get(PostgresConnection);

	const subscribers = container
		.findTaggedServiceIdentifiers<
			DomainEventSubscriber<DomainEvent>
		>("subscriber")
		.map((id) => container.get(id));

	const subscriberToEvents = new DomainEventSubscriberNameToEventNames(
		subscribers,
	);

	console.log(
		`\n🔄 Syncing routing for ${subscribers.length} subscribers...\n`,
	);

	for (const [subscriberName, eventNames] of subscriberToEvents.all()) {
		for (const eventName of eventNames) {
			await connection.sql`
				INSERT INTO public.domain_events_routing (event_name, subscriber_name)
				VALUES (${eventName}, ${subscriberName})
				ON CONFLICT (event_name, subscriber_name) DO NOTHING
			`;

			console.log(`  ✅ ${eventName} → ${subscriberName}`);
		}
	}

	console.log(`\n✨ Routing sync completed!\n`);
}

main()
	.catch((error) => {
		console.error("❌ Error during routing sync:", error);
		process.exit(1);
	})
	.finally(async () => {
		await container.get(PostgresConnection).end();
		console.log("🔌 Connection closed");
		process.exit(0);
	});
