import { Service } from "diod";

import { PostgresRepository } from "../../../shared/infrastructure/postgres/PostgresRepository";
import { User } from "../domain/User";
import { UserId } from "../domain/UserId";
import { UserRepository } from "../domain/UserRepository";
import { UserStatus } from "../domain/UserStatus";

type DatabaseUserRow = {
	id: string;
	name: string;
	email: string;
	profile_picture: string;
};

@Service()
export class PostgresUserRepository
	extends PostgresRepository<User>
	implements UserRepository
{
	async save(user: User): Promise<void> {
		const userPrimitives = user.toPrimitives();

		await this.execute`
			INSERT INTO shop.users (id, name, email, profile_picture)
			VALUES (
				${userPrimitives.id},
				${userPrimitives.name},
				${userPrimitives.email},
				${userPrimitives.profilePicture}
			)
			ON CONFLICT (id) DO UPDATE SET
				name = EXCLUDED.name,
				email = EXCLUDED.email,
				profile_picture = EXCLUDED.profile_picture;
		`;
	}

	async search(id: UserId): Promise<User | null> {
		return await this.searchOne`
			SELECT id, name, email, profile_picture
			FROM shop.users
			WHERE id = ${id.value};
		`;
	}

	protected toAggregate(row: DatabaseUserRow): User {
		return User.fromPrimitives({
			id: row.id,
			name: row.name,
			email: row.email,
			profilePicture: row.profile_picture,
			status: UserStatus.Active,
		});
	}
}
