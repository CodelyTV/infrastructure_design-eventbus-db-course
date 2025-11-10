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
import { ProductReviewCreator } from "../../../shop/product-reviews/application/create/ProductReviewCreator";
import { ProductReviewsByProductSearcher } from "../../../shop/product-reviews/application/search-by-product-id/ProductReviewsByProductSearcher";
import { ProductReviewRepository } from "../../../shop/product-reviews/domain/ProductReviewRepository";
import { PostgresProductReviewRepository } from "../../../shop/product-reviews/infrastructure/PostgresProductReviewRepository";
import { ProductSearcher } from "../../../shop/products/application/search/ProductSearcher";
import { AllProductsSearcher } from "../../../shop/products/application/search-all/AllProductsSearcher";
import { ProductRepository } from "../../../shop/products/domain/ProductRepository";
import { PostgresProductRepository } from "../../../shop/products/infrastructure/PostgresProductRepository";
import { ShopUserFinder } from "../../../shop/shop-user/application/find/ShopUserFinder";
import { ShopUserRegistrar } from "../../../shop/shop-user/application/registrar/ShopUserRegistrar";
import { ShopUserSearcher } from "../../../shop/shop-user/application/search/ShopUserSearcher";
import { ShopUserRepository } from "../../../shop/shop-user/domain/ShopUserRepository";
import { PostgresShopUserRepository } from "../../../shop/shop-user/infrastructure/PostgresShopUserRepository";
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
builder.registerAndUse(ShopUserRegistrar);
builder.registerAndUse(ShopUserFinder);
builder.registerAndUse(ShopUserSearcher);

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

// Export container
export const container = builder.build();
