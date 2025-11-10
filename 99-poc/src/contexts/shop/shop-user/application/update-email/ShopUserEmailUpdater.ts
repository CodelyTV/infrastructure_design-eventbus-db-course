import { Service } from "diod";

import { ShopUserFinder } from "../../domain/ShopUserFinder";
import { ShopUserRepository } from "../../domain/ShopUserRepository";

@Service()
export class ShopUserEmailUpdater {
	private readonly finder: ShopUserFinder;

	constructor(private readonly repository: ShopUserRepository) {
		this.finder = new ShopUserFinder(repository);
	}

	async update(id: string, email: string): Promise<void> {
		const user = await this.finder.find(id);

		user.updateEmail(email);

		await this.repository.save(user);
	}
}
