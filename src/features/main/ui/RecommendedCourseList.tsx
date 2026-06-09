import type { Course } from '@/domain/types';
import { CourseCard } from './CourseCard';

export function RecommendedCourseList({ courses }: { courses: Course[] }) {
  return (
    <div data-testid="recommended-course-list" className="flex flex-col gap-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
