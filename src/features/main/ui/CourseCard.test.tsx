import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CourseCard } from './CourseCard';
import { bridgeService } from '@/shared/services/BridgeService';
import type { Course } from '@/domain/types';

const course: Course = {
  id: 'c1',
  title: '테스트 코스',
  description: '설명',
  distanceKm: 4.2,
  estimatedTime: '30분',
  previewImageUrl: 'https://example.com/x.png',
  regionCode: 'gunsan',
};

describe('CourseCard (V02-S3/S5)', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('본문 탭 → openCourseConfirm(course)', () => {
    const spy = vi.spyOn(bridgeService, 'openCourseConfirm').mockImplementation(() => {});
    render(<CourseCard course={course} />);
    fireEvent.click(screen.getByTestId('course-card-c1'));
    expect(spy).toHaveBeenCalledWith(course);
  });

  it('i-버튼 → 미리보기 팝업 열림', () => {
    render(<CourseCard course={course} />);
    fireEvent.click(screen.getByTestId('course-card-info-c1'));
    expect(screen.getByTestId('course-preview-popup')).toBeInTheDocument();
    expect(screen.getByTestId('course-preview-image')).toBeInTheDocument();
  });
});
