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
import { SendWelcomeEmailOnUserRegistered } from "../../../retention/email/application/send-welcome-email/SendWelcomeEmailOnUserRegistered";
import { WelcomeEmailSender } from "../../../retention/email/application/send-welcome-email/WelcomeEmailSender";
import { EmailSender } from "../../../retention/email/domain/EmailSender";
import { FakeEmailSender } from "../../../retention/email/infrastructure/FakeEmailSender";
import { UpdateLastActivityDateOnUserUpdated } from "../../../retention/retention-user/application/update-last-activity-date/UpdateLastActivityDateOnUserUpdated";
import { UserLastActivityUpdater } from "../../../retention/retention-user/application/update-last-activity-date/UserLastActivityUpdater";
import { RetentionUserRepository } from "../../../retention/retention-user/domain/RetentionUserRepository";
import { FakeRetentionUserRepository } from "../../../retention/retention-user/infrastructure/FakeRetentionUserRepository";
import { ProductReviewCreator } from "../../../shop/product-reviews/application/create/ProductReviewCreator";
import { ProductReviewsByProductSearcher } from "../../../shop/product-reviews/application/search-by-product-id/ProductReviewsByProductSearcher";
import { ProductReviewRepository } from "../../../shop/product-reviews/domain/ProductReviewRepository";
import { PostgresProductReviewRepository } from "../../../shop/product-reviews/infrastructure/PostgresProductReviewRepository";
import { ProductSearcher } from "../../../shop/products/application/search/ProductSearcher";
import { AllProductsSearcher } from "../../../shop/products/application/search-all/AllProductsSearcher";
import { ProductRepository } from "../../../shop/products/domain/ProductRepository";
import { PostgresProductRepository } from "../../../shop/products/infrastructure/PostgresProductRepository";
import { ShopUserFinder } from "../../../shop/shop-user/application/find/ShopUserFinder";
import { RegisterShopUserOnUserRegistered } from "../../../shop/shop-user/application/register-on-user-registered/RegisterShopUserOnUserRegistered";
import { ShopUserRegistrar } from "../../../shop/shop-user/application/register-on-user-registered/ShopUserRegistrar";
import { ShopUserSearcher } from "../../../shop/shop-user/application/search/ShopUserSearcher";
import { ShopUserRepository } from "../../../shop/shop-user/domain/ShopUserRepository";
import { PostgresShopUserRepository } from "../../../shop/shop-user/infrastructure/PostgresShopUserRepository";
import { DomainEvent } from "../../domain/event/DomainEvent";
import { DomainEventSubscriber } from "../../domain/event/DomainEventSubscriber";
import { EventBus } from "../../domain/event/EventBus";
import { UuidGenerator } from "../../domain/UuidGenerator";
import { PostgresEventBus } from "../domain-event/PostgresEventBus";
import { NativeUuidGenerator } from "../NativeUuidGenerator";
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

builder.register(UuidGenerator).use(NativeUuidGenerator);
builder.register(EmailSender).use(FakeEmailSender);

// Mooc - User
builder.register(UserRepository).use(PostgresUserRepository);
builder.registerAndUse(PostgresUserRepository);
builder.registerAndUse(UserRegistrar);
builder.registerAndUse(UserFinder);
builder.registerAndUse(DomainUserFinder);

// Mooc - Course
builder.register(CourseRepository).use(PostgresCourseRepository);
builder.registerAndUse(PostgresCourseRepository);
builder.registerAndUse(CourseFinder);
builder.registerAndUse(CourseSearcher);
builder.registerAndUse(CoursesByIdsSearcher);
builder.registerAndUse(AllCoursesSearcher);

// Shop - User
builder.register(ShopUserRepository).use(PostgresShopUserRepository);
builder.registerAndUse(PostgresShopUserRepository);
builder.registerAndUse(ShopUserFinder);
builder.registerAndUse(ShopUserSearcher);
builder.registerAndUse(ShopUserRegistrar);
builder.registerAndUse(RegisterShopUserOnUserRegistered).addTag("subscriber");

// Shop - Product
builder.register(ProductRepository).use(PostgresProductRepository);
builder.registerAndUse(PostgresProductRepository);
builder.registerAndUse(ProductSearcher);
builder.registerAndUse(AllProductsSearcher);

// Shop - ProductReview
builder.register(ProductReviewRepository).use(PostgresProductReviewRepository);
builder.registerAndUse(PostgresProductReviewRepository);
builder.registerAndUse(ProductReviewCreator);
builder.registerAndUse(ProductReviewsByProductSearcher);

// Retention - User
builder.register(RetentionUserRepository).use(FakeRetentionUserRepository);
builder.registerAndUse(FakeRetentionUserRepository);
builder.registerAndUse(UserLastActivityUpdater);
builder
	.registerAndUse(UpdateLastActivityDateOnUserUpdated)
	.addTag("subscriber");

// Retention - Email
builder.registerAndUse(WelcomeEmailSender);
builder.registerAndUse(SendWelcomeEmailOnUserRegistered).addTag("subscriber");

builder
	.register(PostgresEventBus)
	.useFactory((container) => {
		const eventSubscribersGetter =
			(): DomainEventSubscriber<DomainEvent>[] =>
				container
					.findTaggedServiceIdentifiers<
						DomainEventSubscriber<DomainEvent>
					>("subscriber")
					.map(
						(id) =>
							container.get(
								id,
							) as DomainEventSubscriber<DomainEvent>,
					);

		return new PostgresEventBus(
			container.get(PostgresConnection),
			eventSubscribersGetter,
		);
	})
	.asSingleton();

builder
	.register(EventBus)
	.useFactory((deps) => deps.get(PostgresEventBus))
	.asSingleton();

export const container = builder.build();
