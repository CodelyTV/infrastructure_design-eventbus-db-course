import { Service } from "diod";

import { DomainEventClass } from "../../../../shared/domain/event/DomainEventClass";
import { DomainEventSubscriber } from "../../../../shared/domain/event/DomainEventSubscriber";
import { ShopUserRegisteredDomainEvent } from "../../../../shop/shop-user/domain/ShopUserRegisteredDomainEvent";

import { WelcomeEmailSender } from "./WelcomeEmailSender";

@Service()
export class SendWelcomeEmailOnUserRegistered
	implements DomainEventSubscriber<ShopUserRegisteredDomainEvent>
{
	constructor(private readonly sender: WelcomeEmailSender) {}

	async on(event: ShopUserRegisteredDomainEvent): Promise<void> {
		await this.sender.send(event.id, event.name, event.email);
	}

	subscribedTo(): DomainEventClass[] {
		return [ShopUserRegisteredDomainEvent];
	}

	name(): string {
		return "codely.retention.send_welcome_email_on_user_registered";
	}
}
