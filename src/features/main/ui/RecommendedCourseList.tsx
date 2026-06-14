import type { Course } from '@/domain/types';
import { CourseCard } from './CourseCard';

export function RecommendedCourseList({ courses }: { courses: Course[] }) {
  return (
    <ul data-testid="recommended-course-list" className="flex flex-col gap-2">
      {courses.map((course) => (
        <li key={course.id}>
          <CourseCard course={course} />
        </li>
      ))}
    </ul>
  );
}
