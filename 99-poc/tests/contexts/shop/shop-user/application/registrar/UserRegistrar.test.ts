import { ShopUserRegistrar } from "../../../../../../src/contexts/shop/shop-user/application/registrar/ShopUserRegistrar";
import { MockEventBus } from "../../../../shared/infrastructure/MockEventBus";
import { ShopUserMother } from "../../domain/ShopUserMother";
import { ShopUserRegisteredDomainEventMother } from "../../domain/ShopUserRegisteredDomainEventMother";
import { MockShopUserRepository } from "../../infrastructure/MockShopUserRepository";

describe("ShopUserRegistrar should", () => {
	const repository = new MockShopUserRepository();
	const eventBus = new MockEventBus();
	const userRegistrar = new ShopUserRegistrar(repository, eventBus);

	it("register a valid user", async () => {
		const expectedUser = ShopUserMother.create();
		const expectedUserPrimitives = expectedUser.toPrimitives();

		const expectedDomainEvent = ShopUserRegisteredDomainEventMother.create(
			expectedUserPrimitives,
		);

		repository.shouldSave(expectedUser);
		eventBus.shouldPublish([expectedDomainEvent]);

		await userRegistrar.registrar(
			expectedUserPrimitives.id,
			expectedUserPrimitives.name,
			expectedUserPrimitives.email,
			expectedUserPrimitives.profilePicture,
		);
	});
});
