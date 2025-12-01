import { Service } from "diod";

import { ShopUser } from "../../domain/ShopUser";
import { ShopUserRepository } from "../../domain/ShopUserRepository";

@Service()
export class ShopUserRegistrar {
	constructor(private readonly repository: ShopUserRepository) {}

	async register(id: string, name: string, email: string): Promise<void> {
		const user = ShopUser.create(id, name, email);

		await this.repository.save(user);
	}
}
