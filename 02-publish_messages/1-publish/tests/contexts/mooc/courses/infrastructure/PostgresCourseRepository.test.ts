import "reflect-metadata";

import { PostgresCourseRepository } from "../../../../../src/contexts/mooc/courses/infrastructure/PostgresCourseRepository";
import { container } from "../../../../../src/contexts/shared/infrastructure/dependency-injection/diod.config";
import { PostgresConnection } from "../../../../../src/contexts/shared/infrastructure/postgres/PostgresConnection";
import { CourseIdMother } from "../domain/CourseIdMother";
import { CourseMother } from "../domain/CourseMother";

const connection = container.get(PostgresConnection);
const repository = container.get(PostgresCourseRepository);

describe("PostgresCourseRepository should", () => {
	beforeEach(async () => {
		await connection.truncateAll();
	});

	afterAll(async () => {
		await connection.end();
	});

	it("save a course", async () => {
		const course = CourseMother.create();

		await repository.save(course);
	});

	it("return null searching a non existing course", async () => {
		const courseId = CourseIdMother.create();

		expect(await repository.search(courseId)).toBeNull();
	});

	it("return an existing course", async () => {
		const course = CourseMother.create();

		await repository.save(course);

		expect(await repository.search(course.id)).toStrictEqual(course);
	});

	it("update an existing course when saving with the same id", async () => {
		const courseId = CourseIdMother.create();
		const originalCourse = CourseMother.create({ id: courseId.value });
		const updatedCourse = CourseMother.create({
			id: courseId.value,
			name: "Updated Course Name",
			summary: "Updated summary",
		});

		await repository.save(originalCourse);
		await repository.save(updatedCourse);

		const searchedCourse = await repository.search(courseId);

		expect(searchedCourse).toStrictEqual(updatedCourse);
	});

	describe("searchAll", () => {
		it("return empty array when no courses exist", async () => {
			const courses = await repository.searchAll();

			expect(courses).toHaveLength(0);
		});

		it("return all courses ordered by published date descending", async () => {
			const oldCourse = CourseMother.create({
				publishedAt: new Date("2023-01-01"),
			});
			const recentCourse = CourseMother.create({
				publishedAt: new Date("2024-01-01"),
			});
			const middleCourse = CourseMother.create({
				publishedAt: new Date("2023-06-01"),
			});

			await repository.save(oldCourse);
			await repository.save(recentCourse);
			await repository.save(middleCourse);

			const courses = await repository.searchAll();

			expect(courses).toHaveLength(3);
			expect(courses[0]).toStrictEqual(recentCourse);
			expect(courses[1]).toStrictEqual(middleCourse);
			expect(courses[2]).toStrictEqual(oldCourse);
		});

		it("return all courses without pagination limit", async () => {
			const courses = CourseMother.createList(20);

			await Promise.all(courses.map((course) => repository.save(course)));

			const result = await repository.searchAll();

			expect(result).toHaveLength(20);
		});
	});

	describe("searchByIds", () => {
		it("return empty array when searching with empty ids array", async () => {
			const courses = await repository.searchByIds([]);

			expect(courses).toHaveLength(0);
		});

		it("return empty array when searching for non-existing ids", async () => {
			const nonExistingIds = [
				CourseIdMother.create(),
				CourseIdMother.create(),
			];

			const courses = await repository.searchByIds(nonExistingIds);

			expect(courses).toHaveLength(0);
		});

		it("return only existing courses when searching by ids", async () => {
			const course1 = CourseMother.create();
			const course2 = CourseMother.create();
			const course3 = CourseMother.create();

			await repository.save(course1);
			await repository.save(course2);
			await repository.save(course3);

			const courses = await repository.searchByIds([
				course1.id,
				course3.id,
			]);

			expect(courses).toHaveLength(2);
			expect(courses).toContainEqual(course1);
			expect(courses).toContainEqual(course3);
		});

		it("return courses even if some ids don't exist", async () => {
			const existingCourse = CourseMother.create();
			const nonExistingId = CourseIdMother.create();

			await repository.save(existingCourse);

			const courses = await repository.searchByIds([
				existingCourse.id,
				nonExistingId,
			]);

			expect(courses).toHaveLength(1);
			expect(courses[0]).toStrictEqual(existingCourse);
		});
	});
});
