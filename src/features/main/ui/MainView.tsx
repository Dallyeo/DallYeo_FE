import { useNavigate } from 'react-router-dom';
import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { BottomTabBar } from '@/app/BottomTabBar';
import { AsyncBoundary } from '@/shared/ui/AsyncBoundary';
import { useSelectedRegion } from '@/features/main/model/useRegions';
import { useRecommendedCourses } from '@/features/main/model/useRecommendedCourses';
import { RegionSelector } from './RegionSelector';
import { CreateCourseButton } from './CreateCourseButton';
import { RecommendedCourseList } from './RecommendedCourseList';

/** V02 메인뷰 (V02-S1). 추천 코스 + 지역 + 코스 만들기 + 탭바. 설정은 상단 ≡(햄버거)로 진입. */
export function MainView() {
  const { region } = useSelectedRegion();
  const coursesQuery = useRecommendedCourses(region.code);
  const navigate = useNavigate();

  return (
    <SafeAreaLayout withTabBar>
      <main data-testid="main-view" className="flex flex-1 flex-col gap-4 p-4">
        {/* 상단 앱바: 로고 + 설정 진입 햄버거(≡). 그린 디자인 적용은 후속 화면 리스타일 단계. */}
        <div className="flex items-center justify-between">
          <span className="text-b-22 text-primary">달여</span>
          <button
            type="button"
            data-testid="open-mypage"
            aria-label="설정 메뉴 열기"
            onClick={() => navigate('/mypage')}
            className="text-sb-20 text-text"
          >
            ☰
          </button>
        </div>

        <header className="flex items-center justify-between">
          <h1 className="text-sb-20">추천 코스</h1>
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
