import { Primitives } from "@codelytv/primitives-type";

import { AggregateRoot } from "../../../shared/domain/AggregateRoot";

import { UserBio } from "./UserBio";
import { UserEmail } from "./UserEmail";
import { UserId } from "./UserId";
import { UserName } from "./UserName";
import { UserRegisteredDomainEvent } from "./UserRegisteredDomainEvent";

export class User extends AggregateRoot {
	private constructor(
		public readonly id: UserId,
		public readonly name: UserName,
		public readonly bio: UserBio,
		public email: UserEmail,
	) {
		super();
	}

	static create(id: string, name: string, bio: string, email: string): User {
		const user = new User(
			new UserId(id),
			new UserName(name),
			new UserBio(bio),
			new UserEmail(email),
		);

		user.record(new UserRegisteredDomainEvent(id, name, bio, email));

		return user;
	}

	static fromPrimitives(primitives: Primitives<User>): User {
		return new User(
			new UserId(primitives.id),
			new UserName(primitives.name),
			new UserBio(primitives.bio),
			new UserEmail(primitives.email),
		);
	}

	toPrimitives(): Primitives<User> {
		return {
			id: this.id.value,
			name: this.name.value,
			bio: this.bio.value,
			email: this.email.value,
		};
	}
}
