import { Primitives } from "@codelytv/primitives-type";
import { Service } from "diod";

import { ShopUser } from "../../domain/ShopUser";
import { ShopUserFinder as DomainShopUserFinder } from "../../domain/ShopUserFinder";
import { ShopUserRepository } from "../../domain/ShopUserRepository";

@Service()
export class ShopUserFinder {
	private readonly finder: DomainShopUserFinder;

	constructor(repository: ShopUserRepository) {
		this.finder = new DomainShopUserFinder(repository);
	}

	async find(id: string): Promise<Primitives<ShopUser>> {
		return (await this.finder.find(id)).toPrimitives();
	}
}
