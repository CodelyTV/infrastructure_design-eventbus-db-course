import "reflect-metadata";

import { container } from "../../../../../src/contexts/shared/infrastructure/dependency-injection/diod.config";
import { PostgresConnection } from "../../../../../src/contexts/shared/infrastructure/postgres/PostgresConnection";
import { PostgresShopUserRepository } from "../../../../../src/contexts/shop/shop-user/infrastructure/PostgresShopUserRepository";
import { ShopUserEmailMother } from "../domain/ShopUserEmailMother";
import { ShopUserIdMother } from "../domain/ShopUserIdMother";
import { ShopUserMother } from "../domain/ShopUserMother";

const connection = container.get(PostgresConnection);
const repository = container.get(PostgresShopUserRepository);

describe("PostgresUserRepository should", () => {
	beforeEach(async () => {
		await connection.truncateAll();
	});

	afterAll(async () => {
		await connection.end();
	});

	it("save a user", async () => {
		const user = ShopUserMother.create();

		await repository.save(user);
	});

	it("update an existing user when saving with the same id", async () => {
		const originalUser = ShopUserMother.create();

		const newEmail = ShopUserEmailMother.create();

		const updatedUser = ShopUserMother.create({
			...originalUser.toPrimitives(),
			email: newEmail.value,
		});

		await repository.save(originalUser);
		await repository.save(updatedUser);

		const searchedUser = await repository.search(originalUser.id);

		expect(searchedUser).toStrictEqual(updatedUser);
	});

	it("return null searching a non existing user", async () => {
		const userId = ShopUserIdMother.create();

		expect(await repository.search(userId)).toBeNull();
	});

	it("return existing user", async () => {
		const user = ShopUserMother.create();

		await repository.save(user);

		expect(await repository.search(user.id)).toStrictEqual(user);
	});
});
