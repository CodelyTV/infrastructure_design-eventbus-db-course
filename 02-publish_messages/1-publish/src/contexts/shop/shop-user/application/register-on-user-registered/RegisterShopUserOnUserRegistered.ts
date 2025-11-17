import { Service } from "diod";

import { UserRegisteredDomainEvent } from "../../../../mooc/users/domain/UserRegisteredDomainEvent";
import { DomainEventClass } from "../../../../shared/domain/event/DomainEventClass";
import { DomainEventSubscriber } from "../../../../shared/domain/event/DomainEventSubscriber";

import { ShopUserRegistrar } from "./ShopUserRegistrar";

@Service()
export class RegisterShopUserOnUserRegistered
	implements DomainEventSubscriber<UserRegisteredDomainEvent>
{
	constructor(private readonly registrar: ShopUserRegistrar) {}

	async on(event: UserRegisteredDomainEvent): Promise<void> {
		await this.registrar.register(event.id, event.name, event.email);
	}

	subscribedTo(): DomainEventClass[] {
		return [UserRegisteredDomainEvent];
	}

	name(): string {
		return "codely.shop.register_shop_user_on_user_registered";
	}
}
