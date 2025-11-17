import { RegisterShopUserOnUserRegistered } from "../../../../../../src/contexts/shop/shop-user/application/register-on-user-registered/RegisterShopUserOnUserRegistered";
import { ShopUserRegistrar } from "../../../../../../src/contexts/shop/shop-user/application/register-on-user-registered/ShopUserRegistrar";
import { UserRegisteredDomainEventMother } from "../../../../mooc/users/domain/UserRegisteredDomainEventMother";
import { ShopUserMother } from "../../domain/ShopUserMother";
import { MockShopUserRepository } from "../../infrastructure/MockShopUserRepository";

describe("RegisterShopUserOnUserRegistered should", () => {
	const repository = new MockShopUserRepository();
	const subscriber = new RegisterShopUserOnUserRegistered(
		new ShopUserRegistrar(repository),
	);

	it("register a shop user on user registered", async () => {
		const event = UserRegisteredDomainEventMother.create();

		const shopUser = ShopUserMother.create({
			id: event.id,
			name: event.name,
			email: event.email,
		});

		repository.shouldSave(shopUser);

		await subscriber.on(event);
	});
});
