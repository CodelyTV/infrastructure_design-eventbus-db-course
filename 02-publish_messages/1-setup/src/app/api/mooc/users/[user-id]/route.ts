import "reflect-metadata";

import { NextResponse } from "next/server";

import {
	UserFinder,
	UserFinderErrors,
} from "../../../../../contexts/mooc/users/application/find/UserFinder";
import {
	UserRegistrar,
	UserRegistrarErrors,
} from "../../../../../contexts/mooc/users/application/registrar/UserRegistrar";
import { UserAlreadyExistError } from "../../../../../contexts/mooc/users/domain/UserAlreadyExistError";
import { assertNever } from "../../../../../contexts/shared/domain/assertNever";
import { container } from "../../../../../contexts/shared/infrastructure/dependency-injection/diod.config";
import { executeWithErrorHandling } from "../../../../../contexts/shared/infrastructure/http/executeWithErrorHandling";
import { HttpNextResponse } from "../../../../../contexts/shared/infrastructure/http/HttpNextResponse";

export async function GET(
	_request: Request,
	context: { params: Promise<{ "user-id": string }> },
): Promise<NextResponse> {
	return executeWithErrorHandling(
		async () => {
			const finder = container.get(UserFinder);

			const resolvedParams = await context.params;
			const userId = resolvedParams["user-id"] as string;

			const user = await finder.find(userId);

			return HttpNextResponse.json(user);
		},
		(error: UserFinderErrors) => {
			return HttpNextResponse.codelyError(error, 404);
		},
	);
}

export async function PUT(
	request: Request,
	context: { params: Promise<{ "user-id": string }> },
): Promise<NextResponse> {
	return executeWithErrorHandling(
		async () => {
			const registrar = container.get(UserRegistrar);

			const resolvedParams = await context.params;
			const id = resolvedParams["user-id"] as string;
			const { name, bio, email } = (await request.json()) as {
				name: string;
				bio: string;
				email: string;
			};

			await registrar.registrar(id, name, bio, email);

			return HttpNextResponse.created();
		},
		(error: UserRegistrarErrors) => {
			switch (true) {
				case error instanceof UserAlreadyExistError:
					return HttpNextResponse.codelyError(error, 409);
				default:
					assertNever(error);
			}
		},
	);
}
