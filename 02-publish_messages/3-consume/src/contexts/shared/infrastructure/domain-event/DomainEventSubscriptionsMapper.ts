import { DomainEvent } from "../../domain/event/DomainEvent";
import { DomainEventSubscriber } from "../../domain/event/DomainEventSubscriber";

export type Subscriber = {
	subscriber: (event: DomainEvent) => Promise<void>;
	name: string;
};

export class DomainEventSubscriptionsMapper {
	private readonly subscriptionMap: Map<string, Subscriber[]>;

	constructor(subscribers: DomainEventSubscriber<DomainEvent>[]) {
		this.subscriptionMap = new Map();

		for (const subscriber of subscribers) {
			for (const event of subscriber.subscribedTo()) {
				const currentSubscriptions =
					this.subscriptionMap.get(event.eventName) ?? [];

				const subscription = {
					subscriber: subscriber.on.bind(subscriber),
					name: subscriber.name(),
				};

				const isDuplicate = currentSubscriptions.some(
					(sub) => sub.name === subscription.name,
				);

				if (!isDuplicate) {
					currentSubscriptions.push(subscription);
					this.subscriptionMap.set(
						event.eventName,
						currentSubscriptions,
					);
				}
			}
		}
	}

	searchSubscribers(eventName: string): Subscriber[] {
		return this.subscriptionMap.get(eventName) ?? [];
	}
}
