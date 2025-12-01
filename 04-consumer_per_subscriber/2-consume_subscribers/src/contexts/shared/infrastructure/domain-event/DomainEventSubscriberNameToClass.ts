import { DomainEvent } from "../../domain/event/DomainEvent";
import { DomainEventSubscriber } from "../../domain/event/DomainEventSubscriber";
import { DomainEventSubscriberNotExistError } from "../../domain/event/DomainEventSubscriberNotExistError";

type SubscriberName = string;

export class DomainEventSubscriberNameToClass {
	private readonly subscriberNameToClass: Map<
		SubscriberName,
		DomainEventSubscriber<DomainEvent>
	>;

	constructor(subscribers: DomainEventSubscriber<DomainEvent>[]) {
		this.subscriberNameToClass = new Map();

		subscribers.forEach((subscriber) => {
			this.subscriberNameToClass.set(subscriber.name(), subscriber);
		});
	}

	find(subscriberName: string): DomainEventSubscriber<DomainEvent> {
		const subscriber = this.subscriberNameToClass.get(subscriberName);

		if (!subscriber) {
			throw new DomainEventSubscriberNotExistError(subscriberName);
		}

		return subscriber;
	}
}
