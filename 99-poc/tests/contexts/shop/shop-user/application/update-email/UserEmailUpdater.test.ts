import { ShopUserEmailUpdater } from "../../../../../../src/contexts/shop/shop-user/application/update-email/ShopUserEmailUpdater";
import { MockEventBus } from "../../../../shared/infrastructure/MockEventBus";
import { UserEmailUpdatedDomainEventMother } from "../../domain/ShopUserEmailUpdatedDomainEventMother";
import { MockShopUserRepository } from "../../infrastructure/MockShopUserRepository";

describe("ShopUserEmailUpdater should", () => {
	const repository = new MockShopUserRepository();
	const eventBus = new MockEventBus();
	const userEmailUpdater = new ShopUserEmailUpdater(repository, eventBus);

	it("throw an error if the user does not exist", async () => {
		const userId = ShopUserIdMother.create();
		const email = ShopUserEmailMother.create();

		repository.shouldNotSearch(userId);

		await expect(
			userEmailUpdater.update(userId.value, email.value),
		).rejects.toThrow(new UserDoesNotExist(userId.value));
	});

	it("update the email of an existing user", async () => {
		const existingUser = ShopUserMother.create();
		const newEmail = ShopUserEmailMother.create();

		const userWithNewEmail = ShopUserMother.create({
			...existingUser.toPrimitives(),
			email: newEmail.value,
		});
		const expectedDomainEvent = UserEmailUpdatedDomainEventMother.create({
			id: existingUser.id.value,
			email: newEmail.value,
		});

		repository.shouldSearch(existingUser);
		repository.shouldSave(userWithNewEmail);
		eventBus.shouldPublish([expectedDomainEvent]);

		await userEmailUpdater.update(existingUser.id.value, newEmail.value);
	});
});
