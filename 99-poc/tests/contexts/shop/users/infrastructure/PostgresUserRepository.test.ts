import "reflect-metadata";

import { container } from "../../../../../src/contexts/shared/infrastructure/dependency-injection/diod.config";
import { PostgresConnection } from "../../../../../src/contexts/shared/infrastructure/postgres/PostgresConnection";
import { PostgresUserRepository } from "../../../../../src/contexts/shop/users/infrastructure/PostgresUserRepository";
import { UserEmailMother } from "../domain/UserEmailMother";
import { UserIdMother } from "../domain/UserIdMother";
import { UserMother } from "../domain/UserMother";

const connection = container.get(PostgresConnection);
const repository = container.get(PostgresUserRepository);

describe("PostgresUserRepository should", () => {
	beforeEach(async () => {
		await connection.truncateAll();
	});

	afterAll(async () => {
		await connection.end();
	});

	it("save a user", async () => {
		const user = UserMother.create();

		await repository.save(user);
	});

	it("update an existing user when saving with the same id", async () => {
		const originalUser = UserMother.create();

		const newEmail = UserEmailMother.create();

		const updatedUser = UserMother.create({
			...originalUser.toPrimitives(),
			email: newEmail.value,
		});

		await repository.save(originalUser);
		await repository.save(updatedUser);

		const searchedUser = await repository.search(originalUser.id);

		expect(searchedUser).toStrictEqual(updatedUser);
	});

	it("return null searching a non existing user", async () => {
		const userId = UserIdMother.create();

		expect(await repository.search(userId)).toBeNull();
	});

	it("return existing user", async () => {
		const user = UserMother.create();

		await repository.save(user);

		expect(await repository.search(user.id)).toStrictEqual(user);
	});
});
