import { ShopUser } from "../../../../../src/contexts/shop/shop-user/domain/ShopUser";
import { ShopUserId } from "../../../../../src/contexts/shop/shop-user/domain/ShopUserId";
import { ShopUserRepository } from "../../../../../src/contexts/shop/shop-user/domain/ShopUserRepository";

export class MockShopUserRepository implements ShopUserRepository {
	private readonly mockSave = jest.fn();
	private readonly mockSearch = jest.fn();

	async save(user: ShopUser): Promise<void> {
		expect(this.mockSave).toHaveBeenCalledWith(user.toPrimitives());

		// Or:
		// expect(this.mockSave).toHaveBeenCalledWith(
		// 	expect.objectContaining({
		// 		...user,
		// 		domainEvents: expect.anything(),
		// 	}),
		// );
	}

	async search(id: ShopUserId): Promise<ShopUser | null> {
		expect(this.mockSearch).toHaveBeenCalledWith(id);

		return this.mockSearch() as Promise<ShopUser | null>;
	}

	shouldSave(user: ShopUser): void {
		this.mockSave(user.toPrimitives());
	}

	shouldSearch(user: ShopUser): void {
		this.mockSearch(user.id);
		this.mockSearch.mockReturnValueOnce(user);
	}

	shouldNotSearch(id: ShopUserId): void {
		this.mockSearch(id);
		this.mockSearch.mockReturnValueOnce(null);
	}
}
