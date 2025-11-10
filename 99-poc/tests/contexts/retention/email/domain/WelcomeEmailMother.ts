import {
	WelcomeEmail,
	WelcomeEmailPrimitives,
} from "../../../../../src/contexts/retention/email/domain/WelcomeEmail";
import { EmailAddressMother } from "../../../shared/domain/EmailAddressMother";
import { UserIdMother } from "../../../shop/shop-user/domain/ShopUserIdMother";
import { UserNameMother } from "../../../shop/shop-user/domain/ShopUserNameMother";

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
