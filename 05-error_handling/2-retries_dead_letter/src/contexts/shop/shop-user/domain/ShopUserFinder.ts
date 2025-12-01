import { ShopUser } from "./ShopUser";
import { ShopUserDoesNotExist } from "./ShopUserDoesNotExist";
import { ShopUserId } from "./ShopUserId";
import { ShopUserRepository } from "./ShopUserRepository";

export class ShopUserFinder {
	constructor(private readonly repository: ShopUserRepository) {}

	async find(id: string): Promise<ShopUser> {
		const user = await this.repository.search(new ShopUserId(id));

		if (user === null) {
			throw new ShopUserDoesNotExist(id);
		}

		return user;
	}
}
