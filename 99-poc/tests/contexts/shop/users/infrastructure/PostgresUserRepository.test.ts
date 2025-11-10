import "reflect-metadata";

import { container } from "../../../../../src/contexts/shared/infrastructure/dependency-injection/diod.config";
import { PostgresConnection } from "../../../../../src/contexts/shared/infrastructure/postgres/PostgresConnection";
import { PostgresUserRepository } from "../../../../../src/contexts/shop/users/infrastructure/PostgresUserRepository";
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

	it("return null searching a non existing user", async () => {
		const userId = UserIdMother.create();

		expect(await repository.search(userId)).toBeNull();
	});

	it("return existing user", async () => {
		const user = UserMother.create();

		await repository.save(user);

		expect(await repository.search(user.id)).toStrictEqual(user);
	});

	it("update an existing user when saving with the same id", async () => {
		const userId = UserIdMother.create();
		const originalUser = UserMother.create({ id: userId.value });
		const updatedUser = UserMother.create({
			id: userId.value,
			email: "updated@example.com",
		});

		await repository.save(originalUser);
		await repository.save(updatedUser);

		const searchedUser = await repository.search(userId);

		expect(searchedUser).toStrictEqual(updatedUser);
	});
});
