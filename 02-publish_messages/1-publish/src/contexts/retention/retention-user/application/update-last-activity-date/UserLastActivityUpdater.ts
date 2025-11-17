import { Service } from "diod";

import { UserId } from "../../../../shared/domain/UserId";
import { RetentionUserRepository } from "../../domain/RetentionUserRepository";

@Service()
export class UserLastActivityUpdater {
	constructor(private readonly repository: RetentionUserRepository) {}

	async update(id: string, occurredAt: Date): Promise<void> {
		const user = await this.repository.search(new UserId(id));

		if (user === null) {
			throw new Error(
				`The user with id ${id} does not exists on last activity`,
			);
		}

		if (user.lastActivityDateIsOlderThan(occurredAt)) {
			user.updateLastActivityDate(occurredAt);

			await this.repository.save(user);
		}
	}
}
