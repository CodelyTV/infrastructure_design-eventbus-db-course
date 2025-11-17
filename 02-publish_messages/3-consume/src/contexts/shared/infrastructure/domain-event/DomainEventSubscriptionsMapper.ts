import { DomainEvent } from "../../domain/event/DomainEvent";
import { DomainEventSubscriber } from "../../domain/event/DomainEventSubscriber";

export class DomainEventSubscriptionsMapper {
	private readonly subscriptionMap: Map<
		string,
		DomainEventSubscriber<DomainEvent>[]
	>;

	constructor(subscribers: DomainEventSubscriber<DomainEvent>[]) {
		this.subscriptionMap = new Map();

		for (const subscriber of subscribers) {
			for (const event of subscriber.subscribedTo()) {
				const currentSubscriptions =
					this.subscriptionMap.get(event.eventName) ?? [];

				const hasSubscriberAlreadyBeenAdded = currentSubscriptions.some(
					(sub) => sub.name() === subscriber.name(),
				);

				if (!hasSubscriberAlreadyBeenAdded) {
					currentSubscriptions.push(subscriber);
					this.subscriptionMap.set(
						event.eventName,
						currentSubscriptions,
					);
				}
			}
		}
	}

	searchSubscribers(eventName: string): DomainEventSubscriber<DomainEvent>[] {
		return this.subscriptionMap.get(eventName) ?? [];
	}
}
