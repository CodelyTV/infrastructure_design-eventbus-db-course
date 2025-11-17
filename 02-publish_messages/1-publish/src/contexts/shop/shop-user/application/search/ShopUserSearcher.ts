import { Service } from "diod";

import { ShopUser } from "../../domain/ShopUser";
import { ShopUserId } from "../../domain/ShopUserId";
import { ShopUserRepository } from "../../domain/ShopUserRepository";

@Service()
export class ShopUserSearcher {
	constructor(private readonly repository: ShopUserRepository) {}

	async search(id: string): Promise<ShopUser | null> {
		return this.repository.search(new ShopUserId(id));
	}
}
