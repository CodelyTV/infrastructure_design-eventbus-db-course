import { UserRegistrar } from "../../../../../../src/contexts/mooc/users/application/registrar/UserRegistrar";
import { UserAlreadyExistError } from "../../../../../../src/contexts/mooc/users/domain/UserAlreadyExistError";
import { MockEventBus } from "../../../../shared/infrastructure/MockEventBus";
import { UserMother } from "../../domain/UserMother";
import { UserRegisteredDomainEventMother } from "../../domain/UserRegisteredDomainEventMother";
import { MockUserRepository } from "../../infrastructure/MockUserRepository";

describe("UserRegistrar should", () => {
	const repository = new MockUserRepository();
	const eventBus = new MockEventBus();
	const userRegistrar = new UserRegistrar(repository, eventBus);

	it("register a valid user", async () => {
		const expectedUser = UserMother.create();
		const expectedUserPrimitives = expectedUser.toPrimitives();

		const expectedDomainEvent = UserRegisteredDomainEventMother.create(
			expectedUserPrimitives,
		);

		repository.shouldSearchAndReturnNull(expectedUser.id);
		repository.shouldSave(expectedUser);
		eventBus.shouldPublish([expectedDomainEvent]);

		await userRegistrar.registrar(
			expectedUserPrimitives.id,
			expectedUserPrimitives.name,
			expectedUserPrimitives.bio,
			expectedUserPrimitives.email,
		);
	});

	it("throw error when user already exists", async () => {
		const existingUser = UserMother.create();
		const existingUserPrimitives = existingUser.toPrimitives();

		repository.shouldSearch(existingUser);

		await expect(
			userRegistrar.registrar(
				existingUserPrimitives.id,
				existingUserPrimitives.name,
				existingUserPrimitives.bio,
				existingUserPrimitives.email,
			),
		).rejects.toThrow(UserAlreadyExistError);
	});
});
