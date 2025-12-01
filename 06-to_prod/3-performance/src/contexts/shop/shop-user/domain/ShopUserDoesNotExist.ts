export class ShopUserDoesNotExist extends Error {
	constructor(id: string) {
		super(`The user ${id} does not exist`);
	}
}
