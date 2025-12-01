import "reflect-metadata";

import { NextRequest, NextResponse } from "next/server";

import { container } from "../../../../contexts/shared/infrastructure/dependency-injection/diod.config";
import { PostgresEventBus } from "../../../../contexts/shared/infrastructure/domain-event/PostgresEventBus";
import { HttpNextResponse } from "../../../../contexts/shared/infrastructure/http/HttpNextResponse";
import { withErrorHandling } from "../../../../contexts/shared/infrastructure/http/withErrorHandling";

export const GET = withErrorHandling(
	async (request: NextRequest): Promise<NextResponse> => {
		const searchParams = request.nextUrl.searchParams;
		const subscribersParam = searchParams.get("subscribers");

		const subscribers: string[] | "*" =
			subscribersParam === null || subscribersParam === "*"
				? "*"
				: subscribersParam.split(",");

		const limit = parseInt(searchParams.get("limit") ?? "10", 10);

		const eventBus = container.get(PostgresEventBus);

		await eventBus.consume(subscribers, limit);

		return HttpNextResponse.ok();
	},
);
