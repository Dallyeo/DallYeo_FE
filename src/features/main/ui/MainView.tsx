import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { BottomTabBar } from '@/app/BottomTabBar';
import { AsyncBoundary } from '@/shared/ui/AsyncBoundary';
import { useSelectedRegion } from '@/features/main/model/useRegions';
import { useRecommendedCourses } from '@/features/main/model/useRecommendedCourses';
import { RegionSelector } from './RegionSelector';
import { CreateCourseButton } from './CreateCourseButton';
import { RecommendedCourseList } from './RecommendedCourseList';

/** V02 메인뷰 (V02-S1). 추천 코스 + 지역 + 코스 만들기 + 탭바. */
export function MainView() {
  const { region } = useSelectedRegion();
  const coursesQuery = useRecommendedCourses(region.code);

  return (
    <SafeAreaLayout withTabBar>
      <main data-testid="main-view" className="flex flex-1 flex-col gap-4 p-4">
        <header className="flex items-center justify-between">
          <h1 className="text-xl">추천 코스</h1>
          <RegionSelector />
        </header>

        <CreateCourseButton />

        <AsyncBoundary
          query={coursesQuery}
          isEmpty={(courses) => courses.length === 0}
          emptyMessage="아직 추천 코스가 없어요."
          loadingLabel="추천 코스를 불러오는 중..."
        >
          {(courses) => <RecommendedCourseList courses={courses} />}
        </AsyncBoundary>
      </main>
      <BottomTabBar />
    </SafeAreaLayout>
  );
}
