import { Service } from "diod";

import { EventBus } from "../../../../shared/domain/event/EventBus";
import { ShopUser } from "../../domain/ShopUser";
import { ShopUserRepository } from "../../domain/ShopUserRepository";

@Service()
export class ShopUserRegistrar {
	constructor(
		private readonly repository: ShopUserRepository,
		private readonly eventBus: EventBus,
	) {}

	async registrar(
		id: string,
		name: string,
		email: string,
		profilePicture: string,
	): Promise<void> {
		const user = ShopUser.create(id, name, email, profilePicture);

		await this.repository.save(user);
		await this.eventBus.publish(user.pullDomainEvents());
	}
}
