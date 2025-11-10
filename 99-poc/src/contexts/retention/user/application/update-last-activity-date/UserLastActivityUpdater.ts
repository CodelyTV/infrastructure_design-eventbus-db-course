import { Service } from "diod";

import { ShopUserId } from "../../../../shop/shop-user/domain/ShopUserId";
import { RetentionUserRepository } from "../../domain/RetentionUserRepository";

@Service()
export class UserLastActivityUpdater {
	constructor(private readonly repository: RetentionUserRepository) {}

	async update(id: string, occurredOn: Date): Promise<void> {
		const user = await this.repository.search(new ShopUserId(id));

		if (user === null) {
			throw new Error(
				`The user with id ${id} does not exists on last activity`,
			);
		}

		if (user.lastActivityDateIsOlderThan(occurredOn)) {
			user.updateLastActivityDate(occurredOn);

			await this.repository.save(user);
		}
	}
}
