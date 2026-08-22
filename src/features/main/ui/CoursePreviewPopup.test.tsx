import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CoursePreviewPopup } from './CoursePreviewPopup';
import type { Course } from '@/domain/types';

const base: Course = {
  id: 'c1',
  title: '근대 역사 박물관 런',
  description: '설명',
  distanceKm: 10,
  estimatedTime: '약 1시간',
  previewImageUrl: 'https://example.com/x.png',
  regionCode: 'GUNSAN',
};

/** 상세 조회(useCourseDetail)를 쓰므로 QueryClientProvider가 필요.
 *  네트워크 없이도 목록 데이터로 먼저 렌더되는지까지 함께 검증한다. */
function renderPopup(course: Course, onClose: () => void = () => {}) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <CoursePreviewPopup course={course} isOpen onClose={onClose} />
    </QueryClientProvider>,
  );
}

const open = (course: Course) => renderPopup(course);

describe('CoursePreviewPopup (V02-S5)', () => {
  it('제목·거리를 시안 문구 형식으로 표시한다', () => {
    open(base);
    expect(screen.getByText('근대 역사 박물관 런')).toBeInTheDocument();
    expect(screen.getByText('거리')).toBeInTheDocument();
    expect(screen.getByText('약 10KM')).toBeInTheDocument();
  });

  it('distanceCategory가 있으면 난이도 행을 라벨로 변환해 표시한다', () => {
    open({ ...base, distanceCategory: 'MEDIUM' });
    expect(screen.getByText('난이도')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('distanceCategory가 없으면 난이도 행을 렌더하지 않는다 (U10-B 이전 백엔드 호환)', () => {
    open(base);
    expect(screen.queryByText('난이도')).not.toBeInTheDocument();
  });

  it('waypoints가 있으면 경유지 목록을, 없으면 목록 자체를 렌더하지 않는다', () => {
    const { unmount } = open({ ...base, waypoints: ['은파호수 공원', '물빛다리'] });
    expect(screen.getByTestId('course-preview-waypoints')).toBeInTheDocument();
    expect(screen.getByText('은파호수 공원')).toBeInTheDocument();
    unmount();

    open(base);
    expect(screen.queryByTestId('course-preview-waypoints')).not.toBeInTheDocument();
  });

  it('이미지 로드 실패 시 플레이스홀더로 대체한다', () => {
    open(base);
    fireEvent.error(screen.getByTestId('course-preview-image'));
    expect(screen.getByTestId('course-preview-image-placeholder')).toBeInTheDocument();
    expect(screen.queryByTestId('course-preview-image')).not.toBeInTheDocument();
  });

  it('닫기 버튼 → onClose 호출', () => {
    const onClose = vi.fn();
    renderPopup(base, onClose);
    fireEvent.click(screen.getByTestId('course-preview-close'));
    expect(onClose).toHaveBeenCalled();
  });
});
