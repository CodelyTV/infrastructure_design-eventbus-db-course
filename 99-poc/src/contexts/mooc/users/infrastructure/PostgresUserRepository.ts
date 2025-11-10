import { Service } from "diod";

import { UserId } from "../../../shared/domain/UserId";
import { PostgresRepository } from "../../../shared/infrastructure/postgres/PostgresRepository";
import { User } from "../domain/User";
import { UserRepository } from "../domain/UserRepository";

type DatabaseUserRow = {
	id: string;
	name: string;
	bio: string;
	email: string;
};

@Service()
export class PostgresUserRepository
	extends PostgresRepository<User>
	implements UserRepository
{
	async save(user: User): Promise<void> {
		const userPrimitives = user.toPrimitives();

		await this.execute`
			INSERT INTO mooc.users (id, name, bio, email)
			VALUES (
				${userPrimitives.id},
				${userPrimitives.name},
				${userPrimitives.bio},
				${userPrimitives.email}
			)
			ON CONFLICT (id) DO UPDATE SET
				name = EXCLUDED.name,
				bio = EXCLUDED.bio,
				email = EXCLUDED.email;
		`;
	}

	async search(id: UserId): Promise<User | null> {
		return await this.searchOne`
			SELECT id, name, bio, email
			FROM mooc.users
			WHERE id = ${id.value};
		`;
	}

	protected toAggregate(row: DatabaseUserRow): User {
		return User.fromPrimitives({
			id: row.id,
			name: row.name,
			bio: row.bio,
			email: row.email,
		});
	}
}
