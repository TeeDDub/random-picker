'use client';

import React, { useState } from 'react';
import { FiUsers, FiShuffle, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { DataItem } from '@/types';

interface TeamDividerProps {
  data: DataItem[];
}

interface Team {
  id: string;
  name: string;
  members: DataItem[];
}

const TEAM_COLORS = [
  'bg-red-100 border-red-300 text-red-800',
  'bg-blue-100 border-blue-300 text-blue-800',
  'bg-green-100 border-green-300 text-green-800',
  'bg-yellow-100 border-yellow-300 text-yellow-800',
  'bg-purple-100 border-purple-300 text-purple-800',
  'bg-pink-100 border-pink-300 text-pink-800',
  'bg-indigo-100 border-indigo-300 text-indigo-800',
  'bg-orange-100 border-orange-300 text-orange-800',
  'bg-teal-100 border-teal-300 text-teal-800',
  'bg-cyan-100 border-cyan-300 text-cyan-800',
  'bg-lime-100 border-lime-300 text-lime-800',
  'bg-amber-100 border-amber-300 text-amber-800',
  'bg-emerald-100 border-emerald-300 text-emerald-800',
  'bg-violet-100 border-violet-300 text-violet-800',
  'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-800',
  'bg-rose-100 border-rose-300 text-rose-800',
  'bg-sky-100 border-sky-300 text-sky-800',
  'bg-slate-100 border-slate-300 text-slate-800',
  'bg-zinc-100 border-zinc-300 text-zinc-800',
  'bg-stone-100 border-stone-300 text-stone-800',
];

export const TeamDivider: React.FC<TeamDividerProps> = ({ data }) => {
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<Team[]>([]);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentMemberIndex, setCurrentMemberIndex] = useState(-1);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(-1);
  const [stepByStepMode, setStepByStepMode] = useState(false);
  const [shuffledData, setShuffledData] = useState<DataItem[]>([]);
  const [nextMemberIndex, setNextMemberIndex] = useState(0);
  const [rouletteCandidate, setRouletteCandidate] = useState<DataItem | null>(null);

  // URL, 이미지, 유튜브 링크인지 확인
  const isMediaContent = (value: string): boolean => {
    if (!value) return false;
    const trimmed = value.trim();
    
    // URL 패턴
    const urlPattern = /^https?:\/\//i;
    if (urlPattern.test(trimmed)) return true;
    
    // 이미지 확장자
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
    if (imageExtensions.test(trimmed)) return true;
    
    // 유튜브 패턴
    if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) return true;
    
    return false;
  };

  const handleDivideTeams = () => {
    if (data.length === 0) return;

    setIsAnimating(true);
    setCurrentMemberIndex(-1);
    setCurrentTeamIndex(-1);

    // 데이터 셔플
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    
    // 빈 팀 생성
    const newTeams: Team[] = [];
    for (let i = 0; i < teamCount; i++) {
      newTeams.push({
        id: `team-${i}`,
        name: `팀 ${i + 1}`,
        members: [],
      });
    }
    setTeams(newTeams);

    // 룰렛 효과로 멤버 배치
    let memberIdx = 0;
    const startTime = Date.now();
    const totalDuration = Math.min(3000, shuffled.length * 150); // 최대 3초

    const placeMember = () => {
      if (memberIdx >= shuffled.length) {
        setIsAnimating(false);
        setCurrentMemberIndex(-1);
        setCurrentTeamIndex(-1);
        return;
      }

      const elapsedTime = Date.now() - startTime;
      const progress = elapsedTime / totalDuration;

      // 현재 멤버와 배치될 팀 인덱스
      const teamIdx = memberIdx % teamCount;
      const currentMember = shuffled[memberIdx];
      
      // 멤버가 유효한지 확인
      if (!currentMember) {
        memberIdx++;
        placeMember();
        return;
      }

      setCurrentMemberIndex(memberIdx);
      setCurrentTeamIndex(teamIdx);

      // 실제 팀에 멤버 추가 (위로 추가)
      setTeams(prevTeams => {
        const updated = [...prevTeams];
        if (updated[teamIdx]) {
          updated[teamIdx] = {
            ...updated[teamIdx],
            members: [currentMember, ...updated[teamIdx].members],
          };
        }
        return updated;
      });

      memberIdx++;

      // 진행도에 따라 속도 조절
      let nextInterval;
      if (progress < 0.3) {
        nextInterval = 50; // 빠르게
      } else if (progress < 0.6) {
        nextInterval = 100; // 보통
      } else if (progress < 0.8) {
        nextInterval = 150; // 느리게
      } else {
        nextInterval = 200; // 매우 느리게
      }

      setTimeout(placeMember, nextInterval);
    };

    // 첫 멤버 배치 시작
    setTimeout(placeMember, 300);
  };

  // 한 명씩 나누기 시작
  const handleStartStepByStep = () => {
    if (data.length === 0) return;

    // 데이터 셔플
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    setShuffledData(shuffled);
    
    // 빈 팀 생성
    const newTeams: Team[] = [];
    for (let i = 0; i < teamCount; i++) {
      newTeams.push({
        id: `team-${i}`,
        name: `팀 ${i + 1}`,
        members: [],
      });
    }
    setTeams(newTeams);
    setNextMemberIndex(0);
    setStepByStepMode(true);
  };

  // 다음 멤버 한 명 배치 (룰렛 효과)
  const handlePlaceNextMember = () => {
    if (nextMemberIndex >= shuffledData.length) {
      setStepByStepMode(false);
      return;
    }

    const finalMember = shuffledData[nextMemberIndex];
    const teamIdx = nextMemberIndex % teamCount;

    if (!finalMember) {
      setNextMemberIndex(nextMemberIndex + 1);
      return;
    }

    setIsAnimating(true);
    setCurrentTeamIndex(teamIdx);

    // 룰렛 효과: 남은 멤버 중에서 랜덤하게 보여주기
    const remainingMembers = shuffledData.slice(nextMemberIndex);
    let spinCounter = 0;
    const startTime = Date.now();
    const totalDuration = 2000; // 2초

    const spinRoulette = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = elapsedTime / totalDuration;

      if (progress >= 1) {
        // 최종 멤버 표시
        setRouletteCandidate(finalMember);
        
        setTimeout(() => {
          // 팀에 추가
          setTeams(prevTeams => {
            const updated = [...prevTeams];
            if (updated[teamIdx]) {
              updated[teamIdx] = {
                ...updated[teamIdx],
                members: [finalMember, ...updated[teamIdx].members],
              };
            }
            return updated;
          });

          setIsAnimating(false);
          setRouletteCandidate(null);
          setCurrentTeamIndex(-1);
          setNextMemberIndex(nextMemberIndex + 1);
        }, 800);
        return;
      }

      // 랜덤하게 후보 선택
      const randomCandidate = remainingMembers[Math.floor(Math.random() * remainingMembers.length)];
      setRouletteCandidate(randomCandidate);
      spinCounter++;

      // 속도 조절
      let nextInterval;
      if (progress < 0.3) {
        nextInterval = 50; // 빠르게
      } else if (progress < 0.6) {
        nextInterval = 100; // 보통
      } else if (progress < 0.8) {
        nextInterval = 150; // 느리게
      } else {
        nextInterval = 250; // 매우 느리게
      }

      setTimeout(spinRoulette, nextInterval);
    };

    spinRoulette();
  };

  // 한 명씩 나누기 취소
  const handleCancelStepByStep = () => {
    setStepByStepMode(false);
    setShuffledData([]);
    setNextMemberIndex(0);
    setCurrentMemberIndex(-1);
    setCurrentTeamIndex(-1);
    setRouletteCandidate(null);
  };

  const handleStartEdit = (team: Team) => {
    setEditingTeamId(team.id);
    setEditingName(team.name);
  };

  const handleSaveEdit = () => {
    if (!editingTeamId) return;
    
    setTeams(teams.map(team => 
      team.id === editingTeamId 
        ? { ...team, name: editingName.trim() || team.name }
        : team
    ));
    
    setEditingTeamId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingTeamId(null);
    setEditingName('');
  };

  return (
    <div className="space-y-6">
      {/* 설정 패널 */}
      <div className="retro-panel p-6 space-y-4">
        <h2 className="retro-section-bar -mx-6 -mt-6">👥 팀나누기</h2>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-inksoft">
            총 {data.length}명을 {teamCount}개 팀으로 나눕니다
          </p>
          <div className="text-right">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-inksoft">팀 개수</span>
              <input
                type="number"
                min="1"
                max="20"
                value={teamCount}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1 && value <= 20) {
                    setTeamCount(value);
                  }
                }}
                disabled={stepByStepMode}
                className="retro-input w-20 px-3 py-2 text-center font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-inksoft mt-1">최대 20개</p>
          </div>
        </div>

        {!stepByStepMode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={handleDivideTeams}
              disabled={data.length === 0 || isAnimating}
              className={`retro-btn retro-btn-signal py-4 px-6 text-base flex items-center justify-center gap-2 ${
                isAnimating ? 'retro-btn-busy' : ''
              }`}
            >
              {isAnimating ? (
                <>
                  <FiShuffle className="animate-spin" size={20} />
                  배치 중... ({currentMemberIndex + 1}/{data.length})
                </>
              ) : (
                <>
                  <FiShuffle size={20} />
                  {teams.length > 0 ? '🔄 한 번에 다시 나누기' : '⚡ 한 번에 나누기'}
                </>
              )}
            </button>

            <button
              onClick={handleStartStepByStep}
              disabled={data.length === 0 || isAnimating}
              className="retro-btn retro-btn-carbon py-4 px-6 text-base flex items-center justify-center gap-2"
            >
              <span>👆</span>
              한 명씩 나누기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="retro-plate border-l-4 border-l-[#ecab37] p-4 text-center">
              <p className="text-base font-bold uppercase tracking-wide text-ink mb-2">
                한 명씩 나누기 모드
              </p>
              <p className="text-sm font-bold text-inksoft">
                진행: {nextMemberIndex} / {shuffledData.length}명
              </p>
            </div>

            {/* 룰렛 후보 표시 */}
            {rouletteCandidate && (
              <div className="retro-hero p-6 animate-pulse">
                <div className="relative space-y-3">
                  <p className="text-center text-[12px] font-bold uppercase tracking-wide text-inksoft">
                    {isAnimating && currentTeamIndex >= 0 ? `팀 ${currentTeamIndex + 1}에 배치 중...` : '선택됨!'}
                  </p>
                  <div className="bg-white/70 rounded-[2px] p-4">
                    <p className="retro-display retro-display-rolling text-2xl mb-3 text-center">
                      {isMediaContent(rouletteCandidate.title) ? '멤버' : rouletteCandidate.title}
                    </p>
                    {Object.entries(rouletteCandidate.properties)
                      .filter(([key, value]) => !isMediaContent(value))
                      .length > 0 && (
                      <div className="space-y-2">
                        {Object.entries(rouletteCandidate.properties)
                          .filter(([key, value]) => !isMediaContent(value))
                          .map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <div className="text-[11px] font-bold uppercase tracking-wide text-inksoft mb-1">{key}</div>
                              <div className="text-ink">{value}</div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handlePlaceNextMember}
                disabled={nextMemberIndex >= shuffledData.length || isAnimating}
                className={`retro-btn retro-btn-signal py-4 px-6 text-base flex items-center justify-center gap-2 ${
                  isAnimating ? 'retro-btn-busy' : ''
                }`}
              >
                {nextMemberIndex >= shuffledData.length ? (
                  <>✅ 완료</>
                ) : (
                  <>
                    ➡️ 다음 멤버 배치
                  </>
                )}
              </button>

              <button
                onClick={handleCancelStepByStep}
                disabled={isAnimating}
                className="retro-btn retro-tab-idle py-4 px-6 text-base flex items-center justify-center gap-2"
              >
                <FiX size={20} />
                취소
              </button>
            </div>
          </div>
        )}

        {data.length === 0 && (
          <div className="text-center text-inksoft text-sm font-bold">
            데이터 입력 화면에서 먼저 데이터를 추가해주세요
          </div>
        )}
      </div>

      {/* 팀 표시 */}
      {teams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {teams.map((team, index) => {
            const colorClass = TEAM_COLORS[index % TEAM_COLORS.length];
            const isEditing = editingTeamId === team.id;
            const isCurrentTeam = isAnimating && currentTeamIndex === index;

            return (
              <div
                key={team.id}
                className={`rounded-md border-2 ${colorClass} p-4 shadow-[0_2px_0_#3d4f97,0_8px_16px_rgba(33,36,46,0.2)] animate-fade-in ${
                  isCurrentTeam ? 'ring-4 ring-signal scale-105' : ''
                } transition-all duration-200`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* 팀 헤더 */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-current border-opacity-30">
                  {isEditing ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                        title="저장"
                      >
                        <FiSave size={16} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                        title="취소"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <FiUsers size={20} />
                        <h3 className="text-lg font-bold">{team.name}</h3>
                      </div>
                      <button
                        onClick={() => handleStartEdit(team)}
                        className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                        title="이름 변경"
                      >
                        <FiEdit2 size={16} />
                      </button>
                    </>
                  )}
                </div>

                {/* 팀 정보 */}
                <div className="mb-3">
                  <span className="text-sm font-semibold opacity-75">
                    {team.members.filter(m => m).length}명
                  </span>
                </div>

                {/* 멤버 리스트 */}
                <div className="space-y-2">
                  {team.members.filter(member => member).map((member, memberIndex) => {
                    const isLatestMember = isAnimating && 
                      memberIndex === 0 && 
                      currentTeamIndex === index;

                    return (
                      <div
                        key={member.id}
                        className={`bg-white bg-opacity-60 rounded-[2px] p-2 text-sm transition-all duration-300 ${
                          isLatestMember ? 'ring-2 ring-signal animate-pulse' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-gray-600 flex-shrink-0">
                            {memberIndex + 1}.
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 truncate">
                              {member.title}
                            </p>
                            {member.source === 'manual' && (
                              <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-lavender text-ink font-bold rounded-[2px]">
                                직접입력
                              </span>
                            )}
                            {member.source === 'google-sheets' && (
                              <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-canvassoft text-ink font-bold rounded-[2px]">
                                Sheets
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 통계 */}
      {teams.length > 0 && (
        <div className="retro-panel p-6 space-y-4">
          <h3 className="retro-section-bar -mx-6 -mt-6">📊 팀 분배 통계</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="retro-plate p-4 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wide text-inksoft">총 팀 수</p>
              <p className="text-2xl font-black text-ink">{teams.length}</p>
            </div>
            <div className="retro-plate p-4 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wide text-inksoft">총 인원</p>
              <p className="text-2xl font-black text-ink">{data.length}</p>
            </div>
            <div className="retro-plate p-4 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wide text-inksoft">평균 인원</p>
              <p className="text-2xl font-black text-ink">
                {(data.length / teams.length).toFixed(1)}
              </p>
            </div>
            <div className="retro-plate p-4 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wide text-inksoft">최대 인원차</p>
              <p className="text-2xl font-black text-brand">
                {teams.length > 0
                  ? Math.max(...teams.map(t => t.members.filter(m => m).length)) -
                    Math.min(...teams.map(t => t.members.filter(m => m).length))
                  : 0}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

