import { DomainEvent } from "../../domain/event/DomainEvent";
import { DomainEventSubscriber } from "../../domain/event/DomainEventSubscriber";

type SubscriberName = string;
type EventName = string;

export class DomainEventSubscriberNameToEventNames {
	private readonly subscriberNameToEventNames: Map<
		SubscriberName,
		EventName[]
	>;

	constructor(subscribers: DomainEventSubscriber<DomainEvent>[]) {
		this.subscriberNameToEventNames = new Map();

		subscribers.forEach((subscriber) => {
			const eventNames = subscriber
				.subscribedTo()
				.map((eventClass) => eventClass.eventName);

			this.subscriberNameToEventNames.set(subscriber.name(), eventNames);
		});
	}

	all(): Map<SubscriberName, EventName[]> {
		return this.subscriberNameToEventNames;
	}
}
