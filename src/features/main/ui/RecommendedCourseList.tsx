import type { Course } from '@/domain/types';
import { CourseCard } from './CourseCard';

export function RecommendedCourseList({ courses }: { courses: Course[] }) {
  return (
    <ul data-testid="recommended-course-list" className="flex min-h-0 flex-1 flex-col divide-y divide-gray-250 overflow-y-auto">
      {courses.map((course) => (
        <li key={course.id}>
          <CourseCard course={course} />
        </li>
      ))}
    </ul>
  );
}
