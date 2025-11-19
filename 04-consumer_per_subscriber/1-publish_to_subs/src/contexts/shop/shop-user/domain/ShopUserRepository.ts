import { ShopUser } from "./ShopUser";
import { ShopUserId } from "./ShopUserId";

export abstract class ShopUserRepository {
	abstract save(user: ShopUser): Promise<void>;

	abstract search(id: ShopUserId): Promise<ShopUser | null>;
}
