import { Service } from "diod";

import { UserDomainEvent } from "../../../../mooc/users/domain/UserDomainEvent";
import { DomainEventClass } from "../../../../shared/domain/event/DomainEventClass";
import { DomainEventSubscriber } from "../../../../shared/domain/event/DomainEventSubscriber";

import { UserLastActivityUpdater } from "./UserLastActivityUpdater";

@Service()
export class UpdateLastActivityDateOnUserUpdated
	implements DomainEventSubscriber<UserDomainEvent>
{
	constructor(private readonly updater: UserLastActivityUpdater) {}

	async on(event: UserDomainEvent): Promise<void> {
		await this.updater.update(event.id, event.occurredOn);
	}

	subscribedTo(): DomainEventClass[] {
		return [UserDomainEvent];
	}

	name(): string {
		return "codely.retention.update_last_activity_date_on_user_updated";
	}
}
