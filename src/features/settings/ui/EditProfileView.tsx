import { useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { Gender, UserProfilePatch } from '@/domain/types';
import { isValidHeight, isValidWeight } from '@/domain/logic';
import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { AsyncBoundary } from '@/shared/ui/AsyncBoundary';
import { toast } from '@/shared/ui/toastStore';
import { useAuth } from '@/features/login/model/useAuth';
import { useProfile } from '@/features/settings/model/useProfile';
import { profileRepository } from '@/features/settings/api/profileRepository';
import { SettingsAppBar } from './SettingsAppBar';

/** 시안(V13_설정_내정보)은 남성/여성 2개만 노출. `unspecified`는 도메인에만 남긴다. */
const GENDERS: { key: Gender; label: string }[] = [
  { key: 'male', label: '남성' },
  { key: 'female', label: '여성' },
];

/**
 * V13 내정보 수정 (V13_설정_내정보 618:1124).
 * 앱바 → 39 → [키] → 30 → [현재 체중] → 30 → [성별]. 각 그룹 라벨→입력 간격 15.
 * 입력 행 50: 좌우 23 / 상 15, 하단 언더라인 **gray-disabled**(V01 온보딩은 gray-700 — 시안이 서로 다름).
 * 저장은 **앱바 우상단 "저장"**(primary) — `PATCH /users/me`. 뒤로가기는 저장 없이 이동한다.
 */
export function EditProfileView() {
  const { status } = useAuth();
  const profileQuery = useProfile(status === 'authenticated');

  return (
    // 네비게이션바 화면은 상단 여백을 줄인다
    <SafeAreaLayout style={{ '--screen-top-gap': '6px' } as CSSProperties}>
      <AsyncBoundary query={profileQuery} loadingLabel="불러오는 중..." testId="edit-profile">
        {(profile) => <EditForm initial={profile} />}
      </AsyncBoundary>
    </SafeAreaLayout>
  );
}

function EditForm({
  initial,
}: {
  initial: { heightCm?: number; weightKg?: number; gender?: Gender };
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [height, setHeight] = useState(initial.heightCm != null ? String(initial.heightCm) : '');
  const [weight, setWeight] = useState(initial.weightKg != null ? String(initial.weightKg) : '');
  const [gender, setGender] = useState<Gender | undefined>(initial.gender);
  const [saving, setSaving] = useState(false);

  const heightValid = height === '' || isValidHeight(height);
  const weightValid = weight === '' || isValidWeight(weight);

  const nextHeight = height !== '' ? Number(height) : undefined;
  const nextWeight = weight !== '' ? Number(weight) : undefined;
  const changed =
    nextHeight !== initial.heightCm ||
    nextWeight !== initial.weightKg ||
    gender !== initial.gender;
  const canSave = changed && heightValid && weightValid && !saving;

  /** 저장 — 바뀐 필드만 PATCH /users/me 로 전송(부분 갱신) */
  async function save(): Promise<void> {
    if (!canSave) return;
    const patch: UserProfilePatch = {
      ...(nextHeight !== undefined ? { heightCm: nextHeight } : {}),
      ...(nextWeight !== undefined ? { weightKg: nextWeight } : {}),
      ...(gender ? { gender } : {}),
    };
    setSaving(true);
    try {
      await profileRepository.update(patch);
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.show('저장했어요.');
      navigate(-1);
    } catch (e) {
      toast.show(e instanceof Error ? e.message : '저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <SettingsAppBar
        title="내 정보 수정하기"
        onBack={() => navigate(-1)}
        backTestId="edit-back"
        trailing={
          <button
            type="button"
            data-testid="edit-save"
            disabled={!canSave}
            onClick={() => void save()}
            className="px-1 text-label text-green-700 disabled:text-gray-disabled"
          >
            {saving ? '저장 중' : '저장'}
          </button>
        }
      />
      <main
        data-testid="edit-profile-view"
        className="flex flex-1 flex-col gap-[30px] px-4 pb-10 pt-[39px]"
      >
        <NumberField
          label="키"
          unit="cm"
          value={height}
          onChange={setHeight}
          placeholder="167.5"
          testId="edit-height"
          invalid={!heightValid}
          hint="올바른 키를 입력해주세요"
        />

        <NumberField
          label="현재 체중"
          unit="kg"
          value={weight}
          onChange={setWeight}
          placeholder="55.0"
          testId="edit-weight"
          invalid={!weightValid}
          hint="올바른 체중을 입력해주세요"
        />

        {/* 성별 — 시안: 버튼 177×45 r8, 간격 15 */}
        <div className="flex flex-col gap-[15px]">
          <span className={`text-body-sm ${gender ? 'text-gray-700' : 'text-gray-disabled'}`}>
            성별
          </span>
          <div className="flex gap-[15px]">
            {GENDERS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                data-testid={`edit-gender-${key}`}
                aria-pressed={gender === key}
                onClick={() => setGender(key)}
                className={`h-[45px] flex-1 rounded-md text-body-sm ${
                  gender === key ? 'bg-green-700 text-off-white' : 'bg-gray-200 text-gray-disabled'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

/** 언더라인 숫자 입력 — 값 좌측 / 단위 우측 (시안 양끝 정렬) */
function NumberField({
  label,
  unit,
  value,
  onChange,
  placeholder,
  testId,
  invalid,
  hint,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  testId: string;
  invalid: boolean;
  hint: string;
}) {
  const toned = value ? 'text-gray-700' : 'text-gray-disabled';
  return (
    <label className="flex flex-col gap-[15px]">
      <span className={`text-body-sm ${toned}`}>{label}</span>
      <div className="flex items-baseline justify-between gap-2 border-b border-gray-disabled px-[23px] pb-[13px] pt-[15px]">
        <input
          data-testid={testId}
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-subheading text-gray-700 outline-none placeholder:text-gray-disabled"
        />
        <span className={`text-label ${toned}`}>{unit}</span>
      </div>
      {invalid && <span className="text-footnote text-red">{hint}</span>}
    </label>
  );
}
