import "reflect-metadata";

import { ContainerBuilder } from "diod";

import { CourseFinder } from "../../../mooc/courses/application/find/CourseFinder";
import { CourseSearcher } from "../../../mooc/courses/application/search/CourseSearcher";
import { AllCoursesSearcher } from "../../../mooc/courses/application/search-all/AllCoursesSearcher";
import { CoursesByIdsSearcher } from "../../../mooc/courses/application/search-by-ids/CoursesByIdsSearcher";
import { CourseRepository } from "../../../mooc/courses/domain/CourseRepository";
import { PostgresCourseRepository } from "../../../mooc/courses/infrastructure/PostgresCourseRepository";
import { UserFinder } from "../../../mooc/users/application/find/UserFinder";
import { UserRegistrar } from "../../../mooc/users/application/registrar/UserRegistrar";
import { DomainUserFinder } from "../../../mooc/users/domain/DomainUserFinder";
import { UserRepository } from "../../../mooc/users/domain/UserRepository";
import { PostgresUserRepository } from "../../../mooc/users/infrastructure/PostgresUserRepository";
import { EventBus } from "../../domain/event/EventBus";
import { InMemoryEventBus } from "../domain-event/InMemoryEventBus";
import { PostgresConnection } from "../postgres/PostgresConnection";

const builder = new ContainerBuilder();

// Shared
builder
	.register(PostgresConnection)
	.useFactory(() => {
		return new PostgresConnection(
			"localhost",
			5432,
			"supabase_admin",
			"c0d3ly7v",
			"postgres",
		);
	})
	.asSingleton();

builder.register(EventBus).use(InMemoryEventBus);

// User
builder.register(UserRepository).use(PostgresUserRepository);
builder.registerAndUse(PostgresUserRepository);

builder.registerAndUse(UserRegistrar);

builder.registerAndUse(UserFinder);
builder.registerAndUse(DomainUserFinder);

// Course
builder.register(CourseRepository).use(PostgresCourseRepository);
builder.registerAndUse(PostgresCourseRepository);
builder.registerAndUse(CourseFinder);
builder.registerAndUse(CourseSearcher);
builder.registerAndUse(CoursesByIdsSearcher);
builder.registerAndUse(AllCoursesSearcher);

// Export container
export const container = builder.build();
