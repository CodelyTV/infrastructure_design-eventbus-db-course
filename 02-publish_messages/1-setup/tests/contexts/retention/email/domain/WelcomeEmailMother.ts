import {
	WelcomeEmail,
	WelcomeEmailPrimitives,
} from "../../../../../src/contexts/retention/email/domain/WelcomeEmail";
import { UserIdMother } from "../../../mooc/users/domain/UserIdMother";
import { UserNameMother } from "../../../mooc/users/domain/UserNameMother";
import { EmailAddressMother } from "../../../shared/domain/EmailAddressMother";

import { EmailBodyMother } from "./EmailBodyMother";
import { EmailIdMother } from "./EmailIdMother";

export class WelcomeEmailMother {
	static create(params?: Partial<WelcomeEmailPrimitives>): WelcomeEmail {
		const primitives: WelcomeEmailPrimitives = {
			id: EmailIdMother.create().value,
			userId: UserIdMother.create().value,
			userName: UserNameMother.create().value,
			from: EmailAddressMother.create().value,
			to: EmailAddressMother.create().value,
			body: EmailBodyMother.create().value,
			...params,
		};

		return WelcomeEmail.fromPrimitives(primitives);
	}
}
