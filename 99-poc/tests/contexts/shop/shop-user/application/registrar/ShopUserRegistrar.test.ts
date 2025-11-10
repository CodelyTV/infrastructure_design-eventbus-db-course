import { ShopUserRegistrar } from "../../../../../../src/contexts/shop/shop-user/application/registrar/ShopUserRegistrar";
import { ShopUserMother } from "../../domain/ShopUserMother";
import { MockShopUserRepository } from "../../infrastructure/MockShopUserRepository";

describe("ShopUserRegistrar should", () => {
	const repository = new MockShopUserRepository();
	const userRegistrar = new ShopUserRegistrar(repository);

	it("register a valid user", async () => {
		const expectedUser = ShopUserMother.create();
		const expectedUserPrimitives = expectedUser.toPrimitives();

		repository.shouldSave(expectedUser);

		await userRegistrar.registrar(
			expectedUserPrimitives.id,
			expectedUserPrimitives.name,
			expectedUserPrimitives.email,
			expectedUserPrimitives.profilePicture,
		);
	});
});
