import { UserId } from "../../../shared/domain/UserId";

import { User } from "./User";

export abstract class UserRepository {
	abstract save(user: User): Promise<void>;

	abstract search(id: UserId): Promise<User | null>;
}
