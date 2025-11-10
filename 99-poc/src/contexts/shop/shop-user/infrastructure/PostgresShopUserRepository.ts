import { Service } from "diod";

import { PostgresRepository } from "../../../shared/infrastructure/postgres/PostgresRepository";
import { ShopUser } from "../domain/ShopUser";
import { ShopUserId } from "../domain/ShopUserId";
import { ShopUserRepository } from "../domain/ShopUserRepository";
import { ShopUserStatus } from "../domain/ShopUserStatus";

type DatabaseShopUserRow = {
	id: string;
	name: string;
	email: string;
	profile_picture: string;
};

@Service()
export class PostgresShopUserRepository
	extends PostgresRepository<ShopUser>
	implements ShopUserRepository
{
	async save(user: ShopUser): Promise<void> {
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

	async search(id: ShopUserId): Promise<ShopUser | null> {
		return await this.searchOne`
			SELECT id, name, email, profile_picture
			FROM shop.users
			WHERE id = ${id.value};
		`;
	}

	protected toAggregate(row: DatabaseShopUserRow): ShopUser {
		return ShopUser.fromPrimitives({
			id: row.id,
			name: row.name,
			email: row.email,
			profilePicture: row.profile_picture,
			status: ShopUserStatus.Active,
		});
	}
}
