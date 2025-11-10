import { Service } from "diod";

import { DomainEventClass } from "../../../../shared/domain/event/DomainEventClass";
import { DomainEventSubscriber } from "../../../../shared/domain/event/DomainEventSubscriber";
import { ShopUserDomainEvent } from "../../../../shop/shop-user/domain/ShopUserDomainEvent";

import { UserLastActivityUpdater } from "./UserLastActivityUpdater";

@Service()
export class UpdateLastActivityDateOnUserUpdated
	implements DomainEventSubscriber<ShopUserDomainEvent>
{
	constructor(private readonly updater: UserLastActivityUpdater) {}

	async on(event: ShopUserDomainEvent): Promise<void> {
		await this.updater.update(event.id, event.occurredOn);
	}

	subscribedTo(): DomainEventClass[] {
		return [ShopUserDomainEvent];
	}

	name(): string {
		return "codely.retention.update_last_activity_date_on_user_updated";
	}
}
