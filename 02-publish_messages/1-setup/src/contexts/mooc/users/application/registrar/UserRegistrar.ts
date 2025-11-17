import { Service } from "diod";

import { EventBus } from "../../../../shared/domain/event/EventBus";
import { UserId } from "../../../../shared/domain/UserId";
import { User } from "../../domain/User";
import { UserAlreadyExistError } from "../../domain/UserAlreadyExistError";
import { UserRepository } from "../../domain/UserRepository";

@Service()
export class UserRegistrar {
	constructor(
		private readonly repository: UserRepository,
		private readonly eventBus: EventBus,
	) {}

	async registrar(
		id: string,
		name: string,
		bio: string,
		email: string,
	): Promise<void> {
		await this.ensureUserDoesNotAlreadyExist(id);

		const user = User.create(id, name, bio, email);

		await this.repository.save(user);
		await this.eventBus.publish(user.pullDomainEvents());
	}

	private async ensureUserDoesNotAlreadyExist(id: string): Promise<void> {
		const user = await this.repository.search(new UserId(id));

		if (user !== null) {
			throw new UserAlreadyExistError(id);
		}
	}
}
