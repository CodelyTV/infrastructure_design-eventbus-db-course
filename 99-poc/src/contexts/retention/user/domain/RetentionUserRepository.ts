import { ShopUserId } from "../../../shop/shop-user/domain/ShopUserId";

import { RetentionUser } from "./RetentionUser";

export abstract class RetentionUserRepository {
	abstract save(user: RetentionUser): Promise<void>;

	abstract search(id: ShopUserId): Promise<RetentionUser | null>;
}
