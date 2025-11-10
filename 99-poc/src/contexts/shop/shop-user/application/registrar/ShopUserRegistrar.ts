import { Service } from "diod";

import { ShopUser } from "../../domain/ShopUser";
import { ShopUserRepository } from "../../domain/ShopUserRepository";

@Service()
export class ShopUserRegistrar {
	constructor(private readonly repository: ShopUserRepository) {}

	async registrar(
		id: string,
		name: string,
		email: string,
		profilePicture: string,
	): Promise<void> {
		const user = ShopUser.create(id, name, email, profilePicture);

		await this.repository.save(user);
	}
}
