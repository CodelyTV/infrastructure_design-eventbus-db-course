import { CodelyError } from "../../../shared/domain/CodelyError";

export class UserAlreadyExistError extends CodelyError {
	readonly message = "UserAlreadyExistError";

	constructor(readonly id: string) {
		super({ id });
	}
}
