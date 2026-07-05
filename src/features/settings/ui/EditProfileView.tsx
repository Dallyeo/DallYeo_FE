import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { Gender, UserProfilePatch } from '@/domain/types';
import { isValidHeight, isValidWeight } from '@/domain/logic';
import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { AsyncBoundary } from '@/shared/ui/AsyncBoundary';
import { Button } from '@/shared/ui';
import { bridgeService } from '@/shared/services/BridgeService';
import { toast } from '@/shared/ui/toastStore';
import { useAuth } from '@/features/login/model/useAuth';
import { useProfile } from '@/features/settings/model/useProfile';
import { profileRepository } from '@/features/settings/api/profileRepository';
import { Avatar } from './ProfileCard';

const GENDERS: { key: Gender; label: string }[] = [
  { key: 'male', label: '남성' },
  { key: 'female', label: '여성' },
  { key: 'unspecified', label: '입력 안함' },
];

/**
 * V13 내정보 수정 폼 (lo-fi 스켈레톤). 닉네임/사진/키/체중/성별.
 * 키·체중은 온보딩과 동일 하드 검증(비정상값 저장 차단).
 */
export function EditProfileView() {
  const { status } = useAuth();
  const profileQuery = useProfile(status === 'authenticated');

  return (
    <SafeAreaLayout>
      <BackHeader title="내정보 수정하기" />
      <main data-testid="edit-profile-view" className="flex flex-1 flex-col gap-6 overflow-y-auto p-5 pb-10">
        <AsyncBoundary query={profileQuery} loadingLabel="불러오는 중..." testId="edit-profile">
          {(profile) => <EditForm initial={profile} />}
        </AsyncBoundary>
      </main>
    </SafeAreaLayout>
  );
}

function EditForm({
  initial,
}: {
  initial: { nickname: string; photoUrl?: string; heightCm?: number; weightKg?: number; gender?: Gender };
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [nickname, setNickname] = useState(initial.nickname);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(initial.photoUrl);
  const [height, setHeight] = useState(initial.heightCm != null ? String(initial.heightCm) : '');
  const [weight, setWeight] = useState(initial.weightKg != null ? String(initial.weightKg) : '');
  const [gender, setGender] = useState<Gender | undefined>(initial.gender);
  const [saving, setSaving] = useState(false);

  // 값 재수신 시 폼 동기화(최초 1회)
  useEffect(() => {
    setNickname(initial.nickname);
  }, [initial.nickname]);

  const heightValid = height === '' || isValidHeight(height);
  const weightValid = weight === '' || isValidWeight(weight);
  const canSave = nickname.trim().length > 0 && heightValid && weightValid && !saving;

  async function pickPhoto(): Promise<void> {
    try {
      const url = await bridgeService.pickProfilePhoto();
      if (url) setPhotoUrl(url);
    } catch {
      toast.show('사진을 불러오지 못했어요.');
    }
  }

  async function save(): Promise<void> {
    const patch: UserProfilePatch = {
      nickname: nickname.trim(),
      ...(photoUrl ? { photoUrl } : {}),
      ...(height !== '' ? { heightCm: Number(height) } : {}),
      ...(weight !== '' ? { weightKg: Number(weight) } : {}),
      ...(gender ? { gender } : {}),
    };
    setSaving(true);
    try {
      await profileRepository.update(patch);
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.show('저장했어요.');
      navigate(-1);
    } catch {
      toast.show('저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* 아바타 + 닉네임 */}
      <div className="flex items-center gap-4">
        <button type="button" data-testid="edit-photo" onClick={pickPhoto} aria-label="프로필 사진 변경">
          <Avatar photoUrl={photoUrl} nickname={nickname || '?'} />
        </button>
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-m-12 text-subtle">닉네임</span>
          <input
            data-testid="edit-nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-m-15 text-text-strong"
          />
        </label>
      </div>

      <Field label="키" hint={heightValid ? undefined : '올바른 키를 입력해주세요'}>
        <input
          data-testid="edit-height"
          inputMode="decimal"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          placeholder="167.5"
          className="w-full rounded-lg border border-border bg-surface px-3 py-3 text-m-15"
        />
      </Field>

      <Field label="현재 체중" hint={weightValid ? undefined : '올바른 체중을 입력해주세요'}>
        <input
          data-testid="edit-weight"
          inputMode="decimal"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="55.0"
          className="w-full rounded-lg border border-border bg-surface px-3 py-3 text-m-15"
        />
      </Field>

      <Field label="성별">
        <div className="flex gap-2">
          {GENDERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              data-testid={`edit-gender-${key}`}
              aria-pressed={gender === key}
              onClick={() => setGender(key)}
              className={`flex-1 rounded-lg py-3 text-m-15 ${
                gender === key ? 'bg-primary text-primary-contrast' : 'bg-surface text-subtle'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Field>

      <Button className="h-14 rounded-2xl" data-testid="edit-save" disabled={!canSave} onClick={save}>
        저장
      </Button>
    </>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-m-12 text-subtle">{label}</span>
      {children}
      {hint && <span className="text-m-12 text-danger">{hint}</span>}
    </div>
  );
}

function BackHeader({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <header className="flex items-center gap-2 px-4 py-3">
      <button
        type="button"
        data-testid="edit-back"
        aria-label="뒤로가기"
        onClick={() => navigate(-1)}
        className="text-sb-20 text-text-strong"
      >
        ‹
      </button>
      <h1 className="flex-1 text-center text-m-15 text-text-strong">{title}</h1>
      <span className="w-5" aria-hidden />
    </header>
  );
}
