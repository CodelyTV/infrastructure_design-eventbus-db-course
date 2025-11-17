import {
	DomainEvent,
	DomainEventAttributes,
} from "../../domain/event/DomainEvent";
import { DomainEventClass } from "../../domain/event/DomainEventClass";
import { DomainEventSubscriber } from "../../domain/event/DomainEventSubscriber";

type DomainEventClassWithFactory<T extends DomainEvent = DomainEvent> =
	DomainEventClass<T> & {
		fromPrimitives(
			aggregateId: string,
			eventId: string,
			occurredAt: Date,
			attributes: DomainEventAttributes,
		): T;
	};

export class EventMapper {
	private readonly eventMap: Map<string, DomainEventClassWithFactory>;

	constructor(eventClasses: DomainEventClass[]) {
		this.eventMap = new Map();

		for (const eventClass of eventClasses) {
			this.eventMap.set(
				eventClass.eventName,
				eventClass as DomainEventClassWithFactory,
			);
		}
	}

	static fromSubscribers(
		subscribers: DomainEventSubscriber<DomainEvent>[],
	): EventMapper {
		const eventClasses = subscribers.flatMap((subscriber) =>
			subscriber.subscribedTo(),
		);

		const uniqueEventClasses = Array.from(
			new Map(
				eventClasses.map((eventClass) => [
					eventClass.eventName,
					eventClass,
				]),
			).values(),
		);

		return new EventMapper(uniqueEventClasses);
	}

	searchEvent(
		id: string,
		name: string,
		attributes: Record<string, unknown>,
		occurredAt: Date,
	): DomainEvent | null {
		const EventClass = this.eventMap.get(name);

		if (!EventClass) {
			return null;
		}

		const aggregateId = attributes.id as string;

		return EventClass.fromPrimitives(
			aggregateId,
			id,
			occurredAt,
			attributes,
		);
	}
}
