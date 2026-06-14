import { useNavigate } from 'react-router-dom';
import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { BottomTabBar } from '@/app/BottomTabBar';
import { AsyncBoundary } from '@/shared/ui/AsyncBoundary';
import { useAuth } from '@/features/login/model/useAuth';
import { useSelectedRegion } from '@/features/main/model/useRegions';
import { useRecommendedCourses } from '@/features/main/model/useRecommendedCourses';
import { RegionSelector } from './RegionSelector';
import { CreateCourseButton } from './CreateCourseButton';
import { RecommendedCourseList } from './RecommendedCourseList';
import Logo from '@/shared/ui/icons/DallYeo.svg?react';

/** V02 메인뷰 (V02-S1). 그린 헤더(로고·설정·인사말·코스 만들기) + 추천 코스 패널 + 탭바. */
export function MainView() {
  const { region } = useSelectedRegion();
  const coursesQuery = useRecommendedCourses(region.code);
  const { session } = useAuth();
  const navigate = useNavigate();
  const displayName = session?.displayName ?? '러너';

  return (
    <SafeAreaLayout withTabBar>
      <main data-testid="main-view" className="flex flex-1 flex-col">
        {/* 헤더(흰 배경) — 그린 로고 · 설정 · 인사말 · 코스 만들기 */}
        <header className="flex flex-col gap-5 px-4 pb-2 pt-2">
          <div className="flex items-center justify-between">
            <Logo aria-label="달여" className="h-5 w-auto text-primary" />
            <button
              type="button"
              data-testid="open-mypage"
              aria-label="설정 메뉴 열기"
              onClick={() => navigate('/mypage')}
              className="text-sb-20 text-text-strong"
            >
              ☰
            </button>
          </div>

          <h1 className="text-b-22 text-text-strong">
            {displayName} 님,
            <br />
            오늘은 어디로 달려볼까요?
          </h1>

          <CreateCourseButton />
        </header>

        {/* 추천 코스 */}
        <section className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-m-15 text-text">추천 코스</h2>
            <RegionSelector />
          </div>

          <AsyncBoundary
            query={coursesQuery}
            isEmpty={(courses) => courses.length === 0}
            emptyMessage="아직 추천 코스가 없어요."
            loadingLabel="추천 코스를 불러오는 중..."
          >
            {(courses) => <RecommendedCourseList courses={courses} />}
          </AsyncBoundary>
        </section>
      </main>
      <BottomTabBar />
    </SafeAreaLayout>
  );
}
