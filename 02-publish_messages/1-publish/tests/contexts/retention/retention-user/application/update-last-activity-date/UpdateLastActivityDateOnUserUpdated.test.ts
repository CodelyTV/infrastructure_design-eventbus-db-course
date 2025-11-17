import { UserRegisteredDomainEvent } from "../../../../../../src/contexts/mooc/users/domain/UserRegisteredDomainEvent";
import { UpdateLastActivityDateOnUserUpdated } from "../../../../../../src/contexts/retention/retention-user/application/update-last-activity-date/UpdateLastActivityDateOnUserUpdated";
import { UserLastActivityUpdater } from "../../../../../../src/contexts/retention/retention-user/application/update-last-activity-date/UserLastActivityUpdater";
import { UserIdMother } from "../../../../mooc/users/domain/UserIdMother";
import { UserRegisteredDomainEventMother } from "../../../../mooc/users/domain/UserRegisteredDomainEventMother";
import { RetentionUserMother } from "../../domain/RetentionUserMother";
import { MockRetentionUserRepository } from "../../infrastructure/MockRetentionUserRepository";

describe("UpdateLastActivityDateOnUserUpdated should", () => {
	const repository = new MockRetentionUserRepository();
	const subscriber = new UpdateLastActivityDateOnUserUpdated(
		new UserLastActivityUpdater(repository),
	);

	it("throw an error if the user does not exist", async () => {
		const event = UserRegisteredDomainEventMother.create();
		const userId = UserIdMother.create(event.id);

		repository.shouldNotSearch(userId);

		await expect(subscriber.on(event)).rejects.toThrow(Error);
	});

	it("not update last activity when the new is older than the actual", async () => {
		const event = UserRegisteredDomainEventMother.fromYesterday();
		const existingUser = RetentionUserMother.fromToday(event.id);

		repository.shouldSearch(existingUser);

		await subscriber.on(event);
	});

	it("update last activity when the new is newer than the actual", async () => {
		await Promise.all(
			validEvents().map(async (event) => {
				const existingUser = RetentionUserMother.fromYesterday(
					event.id,
				);

				const updatedUser = RetentionUserMother.create({
					...existingUser.toPrimitives(),
					lastActivityDate: event.occurredOn,
				});

				repository.shouldSearch(existingUser);
				repository.shouldSave(updatedUser);

				await subscriber.on(event);
			}),
		);
	});

	function validEvents(): UserRegisteredDomainEvent[] {
		return [UserRegisteredDomainEventMother.fromToday()];
	}
});
