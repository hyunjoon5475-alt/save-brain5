'use strict';

// ==================================================
// OFFROOM — 디지털 웰빙 커뮤니티 MVP
// 기존 localStorage 키는 이전 브라우저 기록을 보존하기 위해 유지합니다.
// DAY 10~20: 조건문, 함수, 배열, DOM, 이벤트, Promise,
// fetch, 고차 함수, localStorage / sessionStorage
// ==================================================

const STORAGE_KEYS = {
  challenge: 'save-brain-v1-challenge',
  checkins: 'save-brain-v1-checkins',
  posts: 'save-brain-v1-posts',
  likedPosts: 'save-brain-v1-liked-posts',
  joinedCrews: 'save-brain-v1-joined-crews',
  crewCheers: 'save-brain-v1-crew-cheers',
  customCrews: 'save-brain-v2-custom-crews',
  crewCheckins: 'save-brain-v2-crew-checkins',
  postReactions: 'save-brain-v2-post-reactions'
};

const SESSION_KEYS = {
  postDraft: 'save-brain-v1-post-draft'
};

const FALLBACK_ACTIVITIES = [
  { id: 'reading', icon: '▤', category: '조용한 시간', title: '책 10페이지 읽기', description: '짧은 글이나 책 한 챕터로 생각의 속도를 늦춰봐요.', minutes: 15, tag: '혼자서도 좋아요' },
  { id: 'walk', icon: '⌁', category: '몸 움직이기', title: '동네 한 바퀴 산책', description: '휴대폰은 잠시 넣어두고 주변 풍경을 천천히 살펴봐요.', minutes: 15, tag: '가볍게 시작' },
  { id: 'music', icon: '♫', category: '감각 깨우기', title: '좋아하는 음악 듣기', description: '화면을 보지 않고 한 곡을 처음부터 끝까지 들어봐요.', minutes: 5, tag: '짧은 리셋' },
  { id: 'journal', icon: '✎', category: '나를 돌아보기', title: '종이에 한 줄 기록하기', description: '오늘 고마웠던 일이나 기억하고 싶은 순간을 적어봐요.', minutes: 5, tag: '아날로그 한 장' },
  { id: 'talk', icon: '♡', category: '사람과 연결', title: '가까운 사람과 대화하기', description: '메시지 대신 목소리로 안부를 묻고 이야기를 나눠봐요.', minutes: 15, tag: '함께하는 시간' },
  { id: 'culture', icon: '✳', category: '새로운 경험', title: '공연·전시 찾아보기', description: '이번 주에 직접 경험해 보고 싶은 문화생활을 찾아봐요.', minutes: 20, tag: '주말 계획' }
];

const FALLBACK_QUOTES = [
  '잠깐 멈춰도, 다시 시작하면 돼요.',
  '오늘의 작은 선택이 내일의 여유가 됩니다.',
  '완벽한 하루보다 나에게 맞는 하루를 만들어요.',
  '스크롤을 멈춘 자리에서 새로운 즐거움을 찾아봐요.',
  '조금 느려도 괜찮아요. 내 속도로 가면 충분해요.',
  '오늘 해낸 작은 약속을 스스로 칭찬해 주세요.',
  '포기하지 말고, 목표를 나에게 맞게 조정해 봐요.'
];

const DEMO_POSTS = [
  {
    id: 'sample-1', nickname: '느린오후', content: '퇴근하고 쇼츠를 켜는 대신 동네를 15분 걸었어요. 바람이 생각보다 좋더라고요. 내일도 한 번 걸어보려고요.',
    type: 'alternative', activity: '산책·운동', likes: 18, comments: [
      { id: 'c-1', nickname: '종이책한장', content: '저도 오늘 저녁 산책 도전할게요!', createdAt: '방금 전' },
      { id: 'c-2', nickname: '작은쉼표', content: '화면 밖에서 보내는 시간이 참 좋죠. 응원해요.' }
    ], createdAt: '화면 예시', createdAtNumber: Date.now() - 8 * 60000, demo: true
  },
  {
    id: 'sample-2', nickname: '종이책한장', content: '자기 전 침대에서 휴대폰을 보지 않고 책을 10페이지 읽었습니다. 처음이라 어색했지만 잠들기 전 마음이 차분해졌어요.',
    type: 'checkin', activity: '독서', likes: 24, comments: [
      { id: 'c-3', nickname: '느린오후', content: '책 10페이지 멋져요. 저도 따라 해볼래요!' }
    ], createdAt: '화면 예시', createdAtNumber: Date.now() - 21 * 60000, demo: true
  },
  {
    id: 'sample-3', nickname: '다시한걸음', content: '3일 챌린지를 마쳤어요! 하루도 빠짐없이 성공한 건 아니지만, 예전보다 무심코 앱을 여는 횟수가 줄었어요. 다시 이어가 보겠습니다.',
    type: 'change', activity: '달라진 일상', likes: 36, comments: [
      { id: 'c-4', nickname: '오늘도천천히', content: '완벽하지 않아도 3일 동안 계속 돌아온 게 정말 멋져요.' },
      { id: 'c-5', nickname: '느린오후', content: '다음 챌린지도 함께해요!' }
    ], createdAt: '화면 예시', createdAtNumber: Date.now() - 45 * 60000, demo: true
  },
  {
    id: 'sample-4', nickname: '오늘도천천히', content: '오늘 인증을 놓쳤다고 실패한 건 아니에요. 내일 다시 시작하면 됩니다. 저도 같이 해볼게요!',
    type: 'cheer', activity: '응원', likes: 12, comments: [], createdAt: '화면 예시', createdAtNumber: Date.now() - 60 * 60000, demo: true
  }
];

const CREWS = [
  {
    id: 'shorts-pause', label: '3 DAYS · SHORTS PAUSE', title: '쇼츠 대신 나의 20분',
    description: '짧은 영상 넘기기를 잠시 멈추고, 하루 20분을 내가 고른 활동으로 채워요.',
    goal: '하루 20분 화면 밖 활동', tone: 'orange', duration: 3, demo: true
  },
  {
    id: 'night-off', label: '7 DAYS · NIGHT RESET', title: '잠들기 전 30분 OFF',
    description: '침대에서는 화면 대신 휴식. 나만의 저녁 루틴을 함께 만들어 봐요.',
    goal: '잠들기 전 30분 휴대폰 내려놓기', tone: 'green', duration: 7, demo: true
  },
  {
    id: 'one-page', label: '7 DAYS · ONE PAGE', title: '하루 한 페이지 클럽',
    description: '영상 대신 책 한 페이지부터. 기억에 남는 문장과 생각을 나눠요.',
    goal: '매일 독서 10분', tone: 'rose', duration: 7, demo: true
  },
  {
    id: 'after-work', label: '3 DAYS · AFTER WORK', title: '퇴근 후 화면 OFF',
    description: '퇴근 후 자동으로 앱을 켜는 습관 대신 산책·음악·대화를 선택해요.',
    goal: '퇴근 후 20분 나를 위한 시간', tone: 'blue', duration: 3, demo: true
  }
];
function readStorage(key, fallbackValue) {
  try {
    const savedValue = localStorage.getItem(key);
    if (savedValue === null) return fallbackValue;
    return JSON.parse(savedValue);
  } catch (error) {
    console.warn(`저장된 데이터(${key})를 읽지 못했습니다.`, error);
    return fallbackValue;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`데이터(${key})를 저장하지 못했습니다.`, error);
    return false;
  }
}

function readSession(key, fallbackValue = '') {
  try {
    const value = sessionStorage.getItem(key);
    return value === null ? fallbackValue : value;
  } catch (error) {
    console.warn(`임시 데이터(${key})를 읽지 못했습니다.`, error);
    return fallbackValue;
  }
}

function writeSession(key, value) {
  try {
    sessionStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`임시 데이터(${key})를 저장하지 못했습니다.`, error);
    return false;
  }
}

// DAY 19: 클로저로 고유 ID 생성기를 만듭니다.
function createIdGenerator(prefix) {
  let sequence = 0;
  return function nextId() {
    sequence += 1;
    return `${prefix}-${Date.now()}-${sequence}`;
  };
}

const createCheckinId = createIdGenerator('checkin');
const createPostId = createIdGenerator('post');

function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(dateKey) {
  if (!dateKey) return '-';
  const [year, month, day] = dateKey.split('-');
  return `${year}.${month}.${day}`;
}

function dayDifference(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  return Math.floor((end.getTime() - start.getTime()) / 86400000);
}

function getChallengeTarget(challenge) {
  if (!challenge) return 0;
  return Math.max(0, Number(challenge.baselineMinutes) - Number(challenge.reductionMinutes));
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

const storedPosts = readStorage(STORAGE_KEYS.posts, null);
const state = {
  challenge: readStorage(STORAGE_KEYS.challenge, null),
  checkins: readStorage(STORAGE_KEYS.checkins, []),
  posts: Array.isArray(storedPosts) ? storedPosts : DEMO_POSTS.slice(),
  likedPosts: readStorage(STORAGE_KEYS.likedPosts, []),
  joinedCrews: readStorage(STORAGE_KEYS.joinedCrews, []),
  crewCheers: readStorage(STORAGE_KEYS.crewCheers, {}),
  customCrews: readStorage(STORAGE_KEYS.customCrews, []),
  crewCheckins: readStorage(STORAGE_KEYS.crewCheckins, {}),
  postReactions: readStorage(STORAGE_KEYS.postReactions, {}),
  communityFilter: 'all',
  expandedComments: [],
  activities: FALLBACK_ACTIVITIES.slice(),
  quotes: FALLBACK_QUOTES.slice(),
  resourceStatus: 'loading',
  selectedActivity: '',
  menuOpen: false
};

// 저장소에 예기치 않은 형태의 값이 있더라도 배열 메서드에서 오류가 나지 않도록 정리합니다.
if (!Array.isArray(state.checkins)) state.checkins = [];
if (!Array.isArray(state.posts)) state.posts = DEMO_POSTS.slice();
if (!Array.isArray(state.likedPosts)) state.likedPosts = [];
if (!Array.isArray(state.joinedCrews)) state.joinedCrews = [];
if (!state.crewCheers || typeof state.crewCheers !== 'object' || Array.isArray(state.crewCheers)) state.crewCheers = {};
if (!Array.isArray(state.customCrews)) state.customCrews = [];
if (!state.crewCheckins || typeof state.crewCheckins !== 'object' || Array.isArray(state.crewCheckins)) state.crewCheckins = {};
if (!state.postReactions || typeof state.postReactions !== 'object' || Array.isArray(state.postReactions)) state.postReactions = {};
state.posts.forEach((post) => { if (!Array.isArray(post.comments)) post.comments = []; if (!post.type) post.type = 'checkin'; if (!post.activity) post.activity = '화면 사용 줄이기'; });

// --------------------------------------------------
// 1. DOM 요소 선택 (DAY 15)
// --------------------------------------------------
const menuToggle = document.querySelector('#menu-toggle');
const mainNav = document.querySelector('#main-nav');

const statChallenge = document.querySelector('#stat-challenge');
const statChallengeSub = document.querySelector('#stat-challenge-sub');
const statRecordDays = document.querySelector('#stat-record-days');
const statSuccessDays = document.querySelector('#stat-success-days');
const dailyQuote = document.querySelector('#daily-quote');
const savedTimeSelect = document.querySelector('#saved-time-select');
const timeDaily = document.querySelector('#time-daily');
const timeWeekly = document.querySelector('#time-weekly');
const timeMonthly = document.querySelector('#time-monthly');
const timeYearly = document.querySelector('#time-yearly');
const timeYearDays = document.querySelector('#time-year-days');
const timeActivityIdeas = document.querySelector('#time-activity-ideas');
const useTimeGoalButton = document.querySelector('#use-time-goal');
const storyPreviewGrid = document.querySelector('#story-preview-grid');

const challengeForm = document.querySelector('#challenge-form');
const challengeMessage = document.querySelector('#challenge-message');
const challengeCategory = document.querySelector('#challenge-category');
const baselineInput = document.querySelector('#baseline-minutes');
const reductionInput = document.querySelector('#reduction-minutes');
const challengeStatus = document.querySelector('#challenge-status');
const challengeEmpty = document.querySelector('#challenge-empty');
const challengeDetail = document.querySelector('#challenge-detail');
const activeCategory = document.querySelector('#active-category');
const activeDuration = document.querySelector('#active-duration');
const activeTarget = document.querySelector('#active-target');
const challengeProgressLabel = document.querySelector('#challenge-progress-label');
const challengeProgressFill = document.querySelector('#challenge-progress-fill');
const activeStartDate = document.querySelector('#active-start-date');
const activeTargetUsage = document.querySelector('#active-target-usage');
const resetChallengeButton = document.querySelector('#reset-challenge');
const continueChallengeButton = document.querySelector('#continue-challenge');
const checkinPanel = document.querySelector('#checkin-panel');
const todayLabel = document.querySelector('#today-label');
const checkinForm = document.querySelector('#checkin-form');
const todayUsageInput = document.querySelector('#today-usage');
const todayActivitySelect = document.querySelector('#today-activity');
const todayReflectionInput = document.querySelector('#today-reflection');
const usageHelp = document.querySelector('#usage-help');
const checkinMessage = document.querySelector('#checkin-message');
const checkinSubmit = document.querySelector('#checkin-submit');
const shareCheckinButton = document.querySelector('#share-checkin-btn');

const resourceStatus = document.querySelector('#resource-status');
const resourceRetry = document.querySelector('#resource-retry');
const activityGrid = document.querySelector('#activity-grid');
const activitySelectedNote = document.querySelector('#activity-selected-note');

const weeklyChart = document.querySelector('#weekly-chart');
const chartAverage = document.querySelector('#chart-average');
const summarySaved = document.querySelector('#summary-saved');
const summaryRecords = document.querySelector('#summary-records');
const summarySuccess = document.querySelector('#summary-success');
const summaryActivities = document.querySelector('#summary-activities');
const summaryEncouragement = document.querySelector('#summary-encouragement');

const crewList = document.querySelector('#crew-list');
const postForm = document.querySelector('#post-form');
const postNicknameInput = document.querySelector('#post-nickname');
const postContentInput = document.querySelector('#post-content');
const postMessage = document.querySelector('#post-message');
const feedList = document.querySelector('#feed-list');
const feedCount = document.querySelector('#feed-count');
const feedFilters = document.querySelector('#feed-filters');
const crewForm = document.querySelector('#crew-form');
const showCrewFormButton = document.querySelector('#show-crew-form');
const cancelCrewFormButton = document.querySelector('#cancel-crew-form');
const crewNameInput = document.querySelector('#crew-name');
const crewGoalInput = document.querySelector('#crew-goal');
const crewDurationSelect = document.querySelector('#crew-duration');
const crewMessage = document.querySelector('#crew-message');
const postTypeSelect = document.querySelector('#post-type');
const postActivitySelect = document.querySelector('#post-activity');

// --------------------------------------------------
// 1-1. 되찾을 시간 계산과 변화 이야기 미리보기
// --------------------------------------------------
function formatMinutes(totalMinutes) {
  const minutes = Math.max(0, Math.round(safeNumber(totalMinutes, 0)));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}분`;
  if (rest === 0) return `${hours}시간`;
  return `${hours}시간 ${rest}분`;
}

function renderTimeActivityIdeas(dailyMinutes) {
  timeActivityIdeas.replaceChildren();
  const heading = document.createElement('strong');
  heading.textContent = '이 시간에 해볼 만한 활동';
  const list = document.createElement('div');
  list.className = 'time-activity-list';
  const candidates = state.activities
    .filter((activity) => safeNumber(activity.minutes, 0) <= dailyMinutes)
    .sort((a, b) => safeNumber(b.minutes, 0) - safeNumber(a.minutes, 0))
    .slice(0, 2);
  const suggestions = candidates.length ? candidates : state.activities.slice().sort((a, b) => safeNumber(a.minutes, 0) - safeNumber(b.minutes, 0)).slice(0, 2);

  suggestions.forEach((activity) => {
    const item = document.createElement('div');
    item.className = 'time-activity-item';
    const description = document.createElement('span');
    description.textContent = `${activity.title} · 약 ${activity.minutes}분`;
    const choose = document.createElement('button');
    choose.type = 'button';
    choose.textContent = '살펴보기';
    choose.addEventListener('click', () => {
      selectActivity(activity.id);
      document.querySelector('#activities').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    item.append(description, choose);
    list.appendChild(item);
  });

  const note = document.createElement('small');
  note.textContent = candidates.length ? '선택한 시간 안에서 시도할 수 있는 활동을 골랐어요.' : '현재 활동 목록에서 짧게 시작할 수 있는 아이디어를 골랐어요. 여러 활동을 나눠 해도 좋아요.';
  timeActivityIdeas.append(heading, list, note);
}

function renderTimeValue() {
  const dailyMinutes = safeNumber(savedTimeSelect.value, 30);
  const weeklyMinutes = dailyMinutes * 7;
  const monthlyMinutes = dailyMinutes * 30;
  const yearlyMinutes = dailyMinutes * 365;
  timeDaily.textContent = formatMinutes(dailyMinutes);
  timeWeekly.textContent = formatMinutes(weeklyMinutes);
  timeMonthly.textContent = formatMinutes(monthlyMinutes);
  timeYearly.textContent = formatMinutes(yearlyMinutes);
  timeYearDays.textContent = `약 ${(yearlyMinutes / 1440).toFixed(1)}일`;
  renderTimeActivityIdeas(dailyMinutes);
}

function renderStoryPreview() {
  storyPreviewGrid.replaceChildren();
  const stories = state.posts
    .filter((post) => ['alternative', 'change', 'checkin'].includes(post.type))
    .slice()
    .sort((a, b) => safeNumber(b.createdAtNumber, 0) - safeNumber(a.createdAtNumber, 0))
    .slice(0, 3);

  if (stories.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'story-preview-empty';
    empty.textContent = '첫 번째 변화 이야기를 기다리고 있어요. 작은 실천부터 기록해 주세요.';
    storyPreviewGrid.appendChild(empty);
    return;
  }

  stories.forEach((post) => {
    const card = document.createElement('article');
    card.className = 'story-preview-card';
    const top = document.createElement('div');
    top.className = 'story-card-top';
    const label = document.createElement('span');
    label.className = 'story-demo-label';
    label.textContent = post.demo ? '화면 예시' : '내 브라우저 기록';
    const activity = document.createElement('span');
    activity.className = 'story-activity-label';
    activity.textContent = post.activity || '화면 밖 활동';
    top.append(label, activity);
    const title = document.createElement('strong');
    title.textContent = post.type === 'change' ? '달라진 일상' : (post.type === 'alternative' ? '새롭게 채운 시간' : '오늘의 실천');
    const copy = document.createElement('p');
    const fullText = String(post.content || '작은 실천을 기록했어요.');
    copy.textContent = fullText.length > 92 ? `${fullText.slice(0, 92)}…` : fullText;
    const footer = document.createElement('div');
    footer.className = 'story-card-footer';
    const author = document.createElement('span');
    author.textContent = `${post.nickname || '리셋 메이트'} · ${post.createdAt || '기록'}`;
    const reactions = document.createElement('strong');
    reactions.textContent = post.demo ? '예시 기록' : `♡ ${safeNumber(post.likes, 0)}`;
    footer.append(author, reactions);
    card.append(top, title, copy, footer);
    storyPreviewGrid.appendChild(card);
  });
}

function useTimeValueForChallenge() {
  const minutes = safeNumber(savedTimeSelect.value, 30);
  const baseline = safeNumber(baselineInput.value, 120);
  if (baseline <= minutes) baselineInput.value = String(Math.min(1440, minutes + 30));
  reductionInput.value = String(minutes);
  document.querySelector('#challenge').scrollIntoView({ behavior: 'smooth', block: 'start' });
  setMessage(challengeMessage, `하루 ${minutes}분 줄이기를 목표에 넣었어요. 기간과 사용 습관을 확인해 주세요.`, 'success');
}

// --------------------------------------------------
// 2. 공통 렌더링 및 저장 함수 (DAY 15, DAY 20)
// --------------------------------------------------
function setMessage(element, message, type = '') {
  element.textContent = message;
  element.classList.toggle('success', type === 'success');
}

function saveChallenge() {
  const saved = writeStorage(STORAGE_KEYS.challenge, state.challenge);
  if (!saved) setMessage(challengeMessage, '브라우저 저장 공간을 확인해 주세요.');
}

function saveCheckins() {
  const saved = writeStorage(STORAGE_KEYS.checkins, state.checkins);
  if (!saved) setMessage(checkinMessage, '기록을 저장하지 못했습니다. 브라우저 저장 공간을 확인해 주세요.');
}

function savePosts() {
  if (!writeStorage(STORAGE_KEYS.posts, state.posts)) {
    setMessage(postMessage, '게시글을 저장하지 못했습니다. 브라우저 저장 공간을 확인해 주세요.');
  }
}

function getChallengeCheckins() {
  if (!state.challenge) return [];
  const start = state.challenge.startDate;
  const endDate = new Date(`${start}T00:00:00`);
  endDate.setDate(endDate.getDate() + Number(state.challenge.duration) - 1);
  const end = getTodayKey(endDate);
  return state.checkins.filter((item) => item.challengeId === state.challenge.id && item.date >= start && item.date <= end);
}

function getTodayCheckin() {
  if (!state.challenge) return null;
  return state.checkins.find((item) => item.challengeId === state.challenge.id && item.date === getTodayKey()) || null;
}

function renderDashboard() {
  const challenge = state.challenge;
  const today = getTodayKey();
  const allRecords = state.checkins;
  const challengeRecords = getChallengeCheckins();
  const successCount = challengeRecords.filter((item) => item.success === true).length;
  const todayRecord = allRecords.find((item) => item.date === today);

  statRecordDays.textContent = String(allRecords.length);
  statSuccessDays.textContent = String(allRecords.filter((item) => item.success === true).length);

  if (!challenge) {
    statChallenge.textContent = '시작 전';
    statChallengeSub.textContent = '나에게 맞는 단계를 골라보세요.';
  } else {
    const elapsed = dayDifference(challenge.startDate, today);
    const progressText = elapsed < 0 ? '시작 예정' : elapsed >= Number(challenge.duration) ? '기간 종료' : `${Math.min(elapsed + 1, Number(challenge.duration))}일 차`;
    statChallenge.textContent = `${challenge.duration}일 챌린지`;
    statChallengeSub.textContent = `${challenge.category} · ${progressText}`;
  }

  if (todayRecord && challenge) {
    const savedMinutes = Math.max(0, Number(challenge.baselineMinutes) - Number(todayRecord.usageMinutes));
    dailyQuote.textContent = savedMinutes > 0 ? `오늘 ${savedMinutes}분의 여유를 만들었어요.` : '기록한 것만으로도 한 걸음이에요.';
  } else {
    const quoteIndex = new Date().getDate() % state.quotes.length;
    dailyQuote.textContent = state.quotes[quoteIndex] || FALLBACK_QUOTES[0];
  }

  // 목표 달성 일수는 현재 챌린지에 속한 기록만 반영합니다.
  if (challenge && successCount === Number(challenge.duration)) {
    statChallengeSub.textContent = '모든 목표를 달성했어요!';
  }
}

function renderChallenge() {
  const challenge = state.challenge;
  const hasChallenge = Boolean(challenge);
  challengeEmpty.hidden = hasChallenge;
  challengeDetail.hidden = !hasChallenge;
  checkinPanel.hidden = !hasChallenge;

  if (!challenge) {
    challengeStatus.textContent = '아직 시작 전';
    challengeStatus.className = 'status-pill status-idle';
    continueChallengeButton.hidden = true;
    return;
  }

  const today = getTodayKey();
  const elapsed = dayDifference(challenge.startDate, today);
  const duration = Number(challenge.duration);
  const records = getChallengeCheckins();
  const successes = records.filter((item) => item.success === true).length;
  const targetMinutes = getChallengeTarget(challenge);
  const todayRecord = getTodayCheckin();
  const isFinished = successes >= duration;
  const isExpired = elapsed >= duration;
  const isNotStarted = elapsed < 0;

  activeCategory.textContent = `${challenge.category} 리셋`;
  activeDuration.textContent = `${duration}일 리셋 챌린지`;
  activeTarget.textContent = `평소보다 하루 ${challenge.reductionMinutes}분 줄여보기`;
  challengeProgressLabel.textContent = `${successes} / ${duration}일`;
  challengeProgressFill.style.width = `${Math.min(100, (successes / duration) * 100)}%`;
  activeStartDate.textContent = formatDate(challenge.startDate);
  activeTargetUsage.textContent = `${targetMinutes}분 이하`;

  if (isFinished) {
    challengeStatus.textContent = '목표 달성';
    challengeStatus.className = 'status-pill status-done';
  } else if (isExpired) {
    challengeStatus.textContent = '기간 종료';
    challengeStatus.className = 'status-pill status-idle';
  } else if (isNotStarted) {
    challengeStatus.textContent = '시작 예정';
    challengeStatus.className = 'status-pill status-idle';
  } else {
    challengeStatus.textContent = '진행 중';
    challengeStatus.className = 'status-pill status-active';
  }

  continueChallengeButton.hidden = !(isExpired || isFinished);
  continueChallengeButton.textContent = isFinished ? '다음 단계로 이어가기 →' : '다시 시작하기 →';

  if (isExpired || isNotStarted || isFinished) {
    checkinPanel.hidden = true;
  } else {
    checkinPanel.hidden = false;
    todayLabel.textContent = `DAY ${elapsed + 1} / ${duration}`;
    usageHelp.textContent = `목표 사용 시간은 ${targetMinutes}분 이하예요. 실제 사용 시간을 솔직하게 기록해 주세요.`;
    todayUsageInput.value = todayRecord ? todayRecord.usageMinutes : '';
    todayActivitySelect.value = todayRecord ? todayRecord.activityId : state.selectedActivity;
    todayReflectionInput.value = todayRecord ? todayRecord.reflection : '';
    checkinSubmit.textContent = todayRecord ? '오늘의 기록 수정하기 ✓' : '오늘의 기록 저장하기 ✓';
    setMessage(checkinMessage, todayRecord ? (todayRecord.success ? '오늘의 목표를 달성했어요. 기록을 수정할 수도 있습니다.' : '오늘의 기록이 저장되어 있어요. 내일 다시 이어가면 됩니다.') : '오늘의 사용 시간과 화면 밖 활동을 기록해 보세요.');
  }
}

function renderActivities() {
  activityGrid.replaceChildren();
  todayActivitySelect.replaceChildren();

  const placeholderOption = document.createElement('option');
  placeholderOption.value = '';
  placeholderOption.textContent = '활동을 선택해 주세요';
  todayActivitySelect.appendChild(placeholderOption);

  state.activities.forEach((activity) => {
    const option = document.createElement('option');
    option.value = activity.id;
    option.textContent = `${activity.title} (${activity.minutes}분)`;
    todayActivitySelect.appendChild(option);

    const card = document.createElement('article');
    card.className = 'activity-card';
    card.classList.toggle('selected', state.selectedActivity === activity.id);

    const top = document.createElement('div');
    top.className = 'activity-top';
    const icon = document.createElement('span');
    icon.className = 'activity-icon';
    icon.textContent = activity.icon;
    const minutes = document.createElement('span');
    minutes.className = 'activity-minutes';
    minutes.textContent = `약 ${activity.minutes} MIN`;
    top.append(icon, minutes);

    const category = document.createElement('p');
    category.className = 'activity-category';
    category.textContent = activity.category;
    const title = document.createElement('h3');
    title.textContent = activity.title;
    const description = document.createElement('p');
    description.textContent = activity.description;

    const bottom = document.createElement('div');
    bottom.className = 'activity-bottom';
    const tag = document.createElement('span');
    tag.className = 'activity-tag';
    tag.textContent = activity.tag;
    const selectButton = document.createElement('button');
    selectButton.type = 'button';
    selectButton.className = 'activity-select';
    selectButton.textContent = state.selectedActivity === activity.id ? '선택됨 ✓' : '오늘 해보기 +';
    selectButton.addEventListener('click', () => selectActivity(activity.id));
    bottom.append(tag, selectButton);

    card.append(top, category, title, description, bottom);
    activityGrid.appendChild(card);
  });

  if (state.selectedActivity && state.activities.some((item) => item.id === state.selectedActivity)) {
    todayActivitySelect.value = state.selectedActivity;
    const selected = state.activities.find((item) => item.id === state.selectedActivity);
    activitySelectedNote.textContent = `오늘의 대체 활동으로 '${selected.title}'을(를) 선택했어요. 챌린지 기록에 담아보세요.`;
  } else {
    activitySelectedNote.textContent = '마음에 드는 활동을 골라 오늘의 실천 기록에 담아 보세요.';
  }
}

function selectActivity(activityId) {
  const activity = state.activities.find((item) => item.id === activityId);
  if (!activity) return;
  state.selectedActivity = activityId;
  todayActivitySelect.value = activityId;
  renderActivities();
  if (state.challenge && !checkinPanel.hidden) {
    todayActivitySelect.value = activityId;
    document.querySelector('#checkin-panel').scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    activitySelectedNote.textContent = '활동을 선택했어요. 먼저 챌린지를 시작하면 오늘의 기록에 저장할 수 있습니다.';
  }
}

function renderProgress() {
  const records = state.checkins.slice();
  const sortedByDate = records.slice().sort((a, b) => a.date.localeCompare(b.date));
  const savedMinutes = sortedByDate.reduce((total, item) => {
    const baseline = item.baselineMinutes || 0;
    return total + Math.max(0, Number(baseline) - Number(item.usageMinutes));
  }, 0);
  const successful = sortedByDate.filter((item) => item.success === true).length;
  const activityCount = sortedByDate.filter((item) => Boolean(item.activityId)).length;

  summarySaved.textContent = String(savedMinutes);
  summaryRecords.textContent = `${records.length}일`;
  summarySuccess.textContent = `${successful}일`;
  summaryActivities.textContent = `${activityCount}회`;

  if (records.length === 0) {
    summaryEncouragement.textContent = '첫 기록을 남기면 나의 작은 성취가 모이기 시작해요.';
  } else if (successful > 0) {
    summaryEncouragement.textContent = `${successful}번 목표를 지켰어요. 작게 해낸 순간을 스스로 칭찬해 주세요.`;
  } else {
    summaryEncouragement.textContent = '기록을 이어가는 것도 변화의 시작이에요. 목표는 언제든 조정할 수 있어요.';
  }

  renderWeeklyChart();
}

function renderWeeklyChart() {
  weeklyChart.replaceChildren();
  const lastSevenDays = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const dateKey = getTodayKey(date);
    const record = state.checkins.find((item) => item.date === dateKey);
    lastSevenDays.push({ date: dateKey, label: ['일', '월', '화', '수', '목', '금', '토'][date.getDay()], record });
  }

  const recordedDays = lastSevenDays.filter((day) => day.record);
  if (recordedDays.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'chart-empty';
    empty.textContent = '기록을 남기면 최근 7일의 사용 시간이 여기에 표시됩니다.';
    weeklyChart.appendChild(empty);
    chartAverage.textContent = '평균 --분';
    return;
  }

  const usageValues = recordedDays.map((day) => Number(day.record.usageMinutes));
  const maxUsage = Math.max(60, ...usageValues);
  const totalUsage = usageValues.reduce((sum, value) => sum + value, 0);
  chartAverage.textContent = `기록일 평균 ${Math.round(totalUsage / usageValues.length)}분`;

  lastSevenDays.forEach((day) => {
    const dayColumn = document.createElement('div');
    dayColumn.className = 'chart-day';
    const barWrap = document.createElement('div');
    barWrap.className = 'chart-bar-wrap';
    const bar = document.createElement('div');
    bar.className = 'chart-bar';

    if (day.record) {
      const height = Math.max(4, (Number(day.record.usageMinutes) / maxUsage) * 100);
      bar.style.height = `${height}%`;
      const value = document.createElement('small');
      value.textContent = `${day.record.usageMinutes}분`;
      bar.appendChild(value);
      bar.title = `${day.date}: ${day.record.usageMinutes}분`;
    } else {
      bar.style.height = '3px';
      bar.style.opacity = '.2';
    }

    const label = document.createElement('span');
    label.textContent = day.label;
    barWrap.appendChild(bar);
    dayColumn.append(barWrap, label);
    weeklyChart.appendChild(dayColumn);
  });
}

function getAllCrews() {
  return CREWS.concat(state.customCrews);
}

function renderCrews() {
  crewList.replaceChildren();
  getAllCrews().forEach((crew) => {
    const isJoined = state.joinedCrews.includes(crew.id);
    const hasCheckedIn = Boolean(state.crewCheckins[crew.id] && state.crewCheckins[crew.id][getTodayKey()]);
    const cheerCount = safeNumber(state.crewCheers[crew.id], 0);
    const isPrototypeCrew = crew.demo === true;
    const participants = safeNumber(crew.participants, 0) + (isJoined && !isPrototypeCrew ? 1 : 0);
    const todayCount = safeNumber(crew.todayCount, 0) + (hasCheckedIn && !isPrototypeCrew ? 1 : 0);
    const progress = Math.min(100, Math.round((todayCount / Math.max(1, participants)) * 100));

    const card = document.createElement('article');
    card.className = `crew-card crew-${crew.tone || 'orange'}`;
    const label = document.createElement('span');
    label.className = 'crew-label';
    label.textContent = crew.label || `${crew.duration || 7} DAYS · COMMUNITY CREW`;
    const title = document.createElement('h3');
    title.textContent = crew.title;
    const description = document.createElement('p');
    description.textContent = crew.description || '함께 목표를 정하고 작은 실천을 나누는 크루입니다.';
    const goal = document.createElement('p');
    goal.className = 'crew-goal';
    goal.textContent = `함께할 목표 · ${crew.goal}`;

    const meta = document.createElement('div');
    meta.className = 'crew-meta';
    const people = document.createElement('span');
    people.textContent = isPrototypeCrew ? '공용 참여 인원 집계 전' : (isJoined ? '이 브라우저에서 참여 중' : '개인 미리보기 크루');
    const today = document.createElement('strong');
    today.textContent = isPrototypeCrew ? '오늘의 인증 현황 집계 전' : (hasCheckedIn ? '오늘 개인 인증 완료' : '오늘의 실천을 기다려요');
    meta.append(people, today);

    const progressTrack = document.createElement('div');
    progressTrack.className = 'crew-progress-track';
    const progressFill = document.createElement('span');
    progressFill.style.width = `${progress}%`;
    progressTrack.appendChild(progressFill);
    progressTrack.hidden = isPrototypeCrew;

    const bottom = document.createElement('div');
    bottom.className = 'crew-card-bottom';
    const status = document.createElement('span');
    status.className = 'crew-status';
    status.textContent = isJoined ? (hasCheckedIn ? '오늘의 인증 완료' : '내가 함께하는 크루') : '지금 참여할 수 있어요';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `crew-join${isJoined ? ' joined' : ''}`;
    button.textContent = isJoined ? (hasCheckedIn ? '인증 완료 ✓' : '오늘 인증하기') : '크루 참여하기';
    button.disabled = isJoined && hasCheckedIn;
    button.addEventListener('click', () => isJoined ? checkinCrew(crew.id) : toggleCrew(crew.id));
    bottom.append(status, button);

    const cheer = document.createElement('button');
    cheer.type = 'button';
    cheer.className = 'crew-cheer';
    cheer.textContent = `크루 응원하기 ♡ ${cheerCount}`;
    cheer.addEventListener('click', () => cheerCrew(crew.id));

    card.append(label, title, description, goal, meta, progressTrack, bottom, cheer);
    crewList.appendChild(card);
  });
}

const POST_TYPE_LABELS = {
  checkin: '오늘의 실천 인증',
  alternative: '대체 활동',
  change: '달라진 일상',
  cheer: '응원 한마디'
};

function renderFeed() {
  feedList.replaceChildren();
  const filtered = state.posts.filter((post) => state.communityFilter === 'all' || post.type === state.communityFilter);
  const posts = filtered.slice().sort((a, b) => safeNumber(b.createdAtNumber, 0) - safeNumber(a.createdAtNumber, 0));
  feedCount.textContent = `${posts.length}개의 이야기`;

  if (posts.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'feed-empty';
    empty.textContent = '아직 이 주제의 이야기가 없어요. 첫 번째 기록을 남겨보세요.';
    feedList.appendChild(empty);
    return;
  }

  posts.forEach((post) => {
    const item = document.createElement('article');
    item.className = 'feed-item';
    const top = document.createElement('div');
    top.className = 'feed-item-top';
    const author = document.createElement('div');
    author.className = 'feed-author';
    const avatar = document.createElement('span');
    avatar.className = 'feed-avatar';
    avatar.textContent = String(post.nickname || 'S').slice(0, 1);
    const authorInfo = document.createElement('span');
    authorInfo.className = 'feed-author-info';
    const nickname = document.createElement('strong');
    nickname.textContent = post.nickname || 'OFFROOM 메이트';
    const postMeta = document.createElement('small');
    postMeta.textContent = post.createdAt || '방금 전';
    authorInfo.append(nickname, postMeta);
    author.append(avatar, authorInfo);
    if (post.demo) {
      const demoTag = document.createElement('small');
      demoTag.className = 'sample-tag';
      demoTag.textContent = '예시';
      author.appendChild(demoTag);
    }
    const typeTag = document.createElement('span');
    typeTag.className = `post-type-tag type-${post.type || 'checkin'}`;
    typeTag.textContent = POST_TYPE_LABELS[post.type] || POST_TYPE_LABELS.checkin;
    top.append(author, typeTag);

    const activity = document.createElement('span');
    activity.className = 'post-activity-chip';
    activity.textContent = `✳ ${post.activity || '화면 사용 줄이기'}`;
    const content = document.createElement('p');
    content.className = 'feed-content';
    content.textContent = post.content;

    const actions = document.createElement('div');
    actions.className = 'feed-actions';
    const reactionGroup = document.createElement('div');
    reactionGroup.className = 'feed-reactions';
    const reactions = state.postReactions[post.id] || {};
    const cheerButton = document.createElement('button');
    cheerButton.type = 'button';
    cheerButton.className = `reaction-button${reactions.cheer ? ' reacted' : ''}`;
    cheerButton.setAttribute('aria-pressed', String(Boolean(reactions.cheer)));
    cheerButton.textContent = `♡ 응원해요 ${safeNumber(post.likes, 0)}`;
    cheerButton.addEventListener('click', () => togglePostReaction(post.id, 'cheer'));
    const meTooButton = document.createElement('button');
    meTooButton.type = 'button';
    meTooButton.className = `reaction-button${reactions.meToo ? ' reacted' : ''}`;
    meTooButton.setAttribute('aria-pressed', String(Boolean(reactions.meToo)));
    meTooButton.textContent = `나도 해볼게요 ${safeNumber(post.meToo, 0)}`;
    meTooButton.addEventListener('click', () => togglePostReaction(post.id, 'meToo'));
    reactionGroup.append(cheerButton, meTooButton);

    const commentToggle = document.createElement('button');
    commentToggle.type = 'button';
    commentToggle.className = 'comment-toggle';
    const comments = Array.isArray(post.comments) ? post.comments : [];
    const expanded = state.expandedComments.includes(post.id);
    commentToggle.textContent = `댓글 ${comments.length}개 ${expanded ? '접기' : '보기'}`;
    commentToggle.setAttribute('aria-expanded', String(expanded));
    commentToggle.addEventListener('click', () => {
      state.expandedComments = expanded ? state.expandedComments.filter((id) => id !== post.id) : state.expandedComments.concat(post.id);
      renderFeed();
    });
    actions.append(reactionGroup, commentToggle);

    const shareButton = document.createElement('button');
    shareButton.type = 'button';
    shareButton.className = 'post-share-button';
    shareButton.textContent = '공유';
    shareButton.addEventListener('click', () => sharePost(post));
    actions.appendChild(shareButton);
    item.append(top, activity, content, actions);

    if (expanded) {
      const commentArea = document.createElement('div');
      commentArea.className = 'comment-area';
      const commentList = document.createElement('div');
      commentList.className = 'comment-list';
      comments.forEach((comment) => {
        const row = document.createElement('p');
        row.className = 'comment-row';
        const name = document.createElement('strong');
        name.textContent = comment.nickname || '리셋 메이트';
        const message = document.createElement('span');
        message.textContent = comment.content;
        row.append(name, message);
        commentList.appendChild(row);
      });
      const commentForm = document.createElement('form');
      commentForm.className = 'comment-form';
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 100;
      input.placeholder = '따뜻한 응원 한마디를 남겨보세요.';
      input.setAttribute('aria-label', '댓글 내용');
      const send = document.createElement('button');
      send.type = 'submit';
      send.textContent = '등록';
      commentForm.append(input, send);
      commentForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const text = input.value.trim();
        if (text.length < 2) {
          input.focus();
          return;
        }
        post.comments = Array.isArray(post.comments) ? post.comments : [];
        post.comments.push({ id: createPostId(), nickname: postNicknameInput.value.trim() || '리셋 메이트', content: text, createdAt: '방금 전' });
        savePosts();
        renderFeed();
      });
      commentArea.append(commentList, commentForm);
      item.appendChild(commentArea);
    }

    if (!post.demo) {
      const ownActions = document.createElement('div');
      ownActions.className = 'own-post-actions';
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'delete-post';
      deleteButton.textContent = '내 기록 삭제';
      deleteButton.addEventListener('click', () => deletePost(post.id));
      ownActions.appendChild(deleteButton);
      item.appendChild(ownActions);
    }
    feedList.appendChild(item);
  });
}

function renderAll() {
  renderDashboard();
  renderChallenge();
  renderProgress();
  renderCrews();
  renderFeed();
  renderStoryPreview();
}

// --------------------------------------------------
// 3. 챌린지 시작 및 매일 기록 (DAY 11, 12, 16, 20)
// --------------------------------------------------
challengeForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(challengeForm);
  const duration = safeNumber(formData.get('duration'), 7);
  const category = String(formData.get('category') || '').trim();
  const baselineMinutes = safeNumber(formData.get('baselineMinutes'), -1);
  const reductionMinutes = safeNumber(formData.get('reductionMinutes'), -1);

  if (![3, 7, 30].includes(duration)) {
    setMessage(challengeMessage, '도전 기간을 다시 선택해 주세요.');
    return;
  }
  if (!category || baselineMinutes < 1 || baselineMinutes > 1440) {
    setMessage(challengeMessage, '평소 하루 사용 시간을 1~1440분 사이로 입력해 주세요.');
    return;
  }
  if (reductionMinutes < 1 || reductionMinutes >= baselineMinutes) {
    setMessage(challengeMessage, '줄일 시간은 1분 이상, 평소 사용 시간보다 짧게 정해 주세요.');
    return;
  }

  if (state.challenge && !confirm('새로운 챌린지를 시작하면 현재 챌린지 화면이 새 목표로 바뀝니다. 계속할까요?')) {
    return;
  }

  state.challenge = {
    id: createCheckinId(),
    duration,
    category,
    baselineMinutes,
    reductionMinutes,
    startDate: getTodayKey(),
    createdAt: new Date().toISOString()
  };
  state.selectedActivity = '';
  saveChallenge();
  setMessage(challengeMessage, '새로운 리셋 챌린지를 시작했어요. 오늘부터 천천히 해봐요!', 'success');
  renderAll();
  document.querySelector('#active-challenge-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
});

continueChallengeButton.addEventListener('click', () => {
  if (!state.challenge) return;
  const previous = state.challenge;
  state.challenge = {
    id: createCheckinId(),
    duration: Number(previous.duration),
    category: previous.category,
    baselineMinutes: Number(previous.baselineMinutes),
    reductionMinutes: Number(previous.reductionMinutes),
    startDate: getTodayKey(),
    createdAt: new Date().toISOString(),
    continuedFrom: previous.id
  };
  state.selectedActivity = '';
  saveChallenge();
  renderAll();
  setMessage(checkinMessage, '새로운 기간을 시작했어요. 이전의 성취를 발판 삼아 내 페이스로 이어가요.', 'success');
  document.querySelector('#active-challenge-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
});

resetChallengeButton.addEventListener('click', () => {
  if (!confirm('현재 챌린지를 종료하고 새로운 목표를 설정할까요? 기존 기록은 남아 있습니다.')) return;
  state.challenge = null;
  state.selectedActivity = '';
  saveChallenge();
  renderAll();
  setMessage(challengeMessage, '새로운 목표를 설정할 수 있어요.', 'success');
});

async function handleCheckinSubmit(event) {
  event.preventDefault();
  if (!state.challenge) {
    setMessage(checkinMessage, '먼저 챌린지를 시작해 주세요.');
    return;
  }

  const elapsed = dayDifference(state.challenge.startDate, getTodayKey());
  if (elapsed < 0 || elapsed >= Number(state.challenge.duration)) {
    setMessage(checkinMessage, '현재 챌린지 기록 기간이 아닙니다. 새로운 목표를 설정해 보세요.');
    return;
  }

  const usageMinutes = safeNumber(todayUsageInput.value, -1);
  const activityId = todayActivitySelect.value;
  const reflection = todayReflectionInput.value.trim();
  if (usageMinutes < 0 || usageMinutes > 1440) {
    setMessage(checkinMessage, '사용 시간을 0~1440분 사이로 입력해 주세요.');
    todayUsageInput.focus();
    return;
  }
  if (!state.activities.some((item) => item.id === activityId)) {
    setMessage(checkinMessage, '화면 밖에서 한 활동을 하나 선택해 주세요.');
    todayActivitySelect.focus();
    return;
  }

  checkinSubmit.disabled = true;
  checkinSubmit.textContent = '기록을 저장하고 있어요...';
  await new Promise((resolve) => setTimeout(resolve, 180));

  const targetMinutes = getChallengeTarget(state.challenge);
  const success = usageMinutes <= targetMinutes;
  const today = getTodayKey();
  const existing = getTodayCheckin();
  const activity = state.activities.find((item) => item.id === activityId);
  const checkin = {
    id: existing ? existing.id : createCheckinId(),
    challengeId: state.challenge.id,
    date: today,
    usageMinutes,
    baselineMinutes: Number(state.challenge.baselineMinutes),
    targetMinutes,
    activityId,
    activityTitle: activity ? activity.title : '',
    reflection,
    success,
    createdAt: new Date().toISOString()
  };

  state.checkins = state.checkins.filter((item) => !(item.challengeId === state.challenge.id && item.date === today));
  state.checkins.push(checkin);
  saveCheckins();
  shareCheckinButton.hidden = false;
  shareCheckinButton.dataset.checkinId = checkin.id;

  if (success) {
    setMessage(checkinMessage, `오늘의 목표를 달성했어요! ${targetMinutes}분 이하로 잘 조절했네요.`, 'success');
  } else {
    setMessage(checkinMessage, '오늘의 기록을 저장했어요. 목표에 조금 못 미쳐도 괜찮아요. 내일 다시 조정해 봐요.', 'success');
  }

  checkinSubmit.disabled = false;
  checkinSubmit.textContent = '오늘의 기록 수정하기 ✓';
  renderAll();
  // renderChallenge가 안내 문구를 다시 설정하므로 직후 결과 문구를 유지합니다.
  setMessage(checkinMessage, success ? '오늘의 목표를 달성했어요! 나의 작은 약속을 지켰습니다.' : '오늘의 기록을 저장했어요. 내일 다시 이어가면 됩니다.', 'success');
}

shareCheckinButton.addEventListener('click', () => {
  const checkin = state.checkins.find((item) => item.id === shareCheckinButton.dataset.checkinId);
  if (!checkin) return;
  const activity = checkin.activityTitle || '화면 밖 활동';
  const content = checkin.reflection || `오늘은 사용 시간을 ${checkin.usageMinutes}분으로 기록하고, ${activity}을(를) 실천했어요. 작은 변화도 함께 나눠요!`;
  state.posts.unshift({
    id: createPostId(),
    nickname: postNicknameInput.value.trim() || '리셋 메이트',
    content,
    type: 'checkin',
    activity,
    likes: 0,
    meToo: 0,
    comments: [],
    createdAt: '방금 전',
    createdAtNumber: Date.now(),
    demo: false
  });
  savePosts();
  state.communityFilter = 'all';
  feedFilters.querySelectorAll('[data-feed-filter]').forEach((button) => {
    const active = button.dataset.feedFilter === 'all';
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  renderFeed();
  renderStoryPreview();
  document.querySelector('#community').scrollIntoView({ behavior: 'smooth' });
});

async function sharePost(post) {
  const text = `[OFFROOM] ${post.nickname}님의 리셋 기록\n${post.content}\n#OFFROOM #디지털웰빙`;
  try {
    if (navigator.share) {
      await navigator.share({ title: 'OFFROOM 리셋 기록', text, url: window.location.href });
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      alert('공유 문구를 복사했어요. SNS에 붙여넣어 주세요.');
    } else {
      alert(text);
    }
  } catch (error) {
    if (error && error.name !== 'AbortError') console.warn('공유를 완료하지 못했습니다.', error);
  }
}

checkinForm.addEventListener('submit', handleCheckinSubmit);

// --------------------------------------------------
// 4. 대체 활동 불러오기: fetch + Promise.all (DAY 17, 18)
// --------------------------------------------------
async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error(`요청에 실패했습니다. (상태 코드 ${response.status})`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

async function loadResources() {
  resourceRetry.disabled = true;
  state.resourceStatus = 'loading';
  resourceStatus.classList.remove('error');
  resourceStatus.textContent = '대체 활동과 오늘의 응원 문구를 불러오는 중...';
  try {
    const [activities, quotes] = await Promise.all([
      fetchJSON('./data/activities.json'),
      fetchJSON('./data/motivation.json')
    ]);

    if (!Array.isArray(activities) || activities.length === 0) {
      throw new Error('대체 활동 데이터 형식이 올바르지 않습니다.');
    }
    if (!Array.isArray(quotes) || quotes.length === 0) {
      throw new Error('응원 문구 데이터 형식이 올바르지 않습니다.');
    }

    state.activities = activities;
    state.quotes = quotes;
    state.resourceStatus = 'success';
    resourceStatus.textContent = '오늘의 대체 활동을 준비했어요. 마음에 드는 활동을 골라보세요.';
    resourceStatus.classList.remove('error');
  } catch (error) {
    console.warn('추천 데이터를 불러오지 못해 기본 데이터를 사용합니다.', error);
    state.activities = FALLBACK_ACTIVITIES.slice();
    state.quotes = FALLBACK_QUOTES.slice();
    state.resourceStatus = 'error';
    resourceStatus.textContent = '추천 데이터를 불러오지 못해 기본 목록을 표시하고 있어요. 잠시 후 다시 시도해 주세요.';
    resourceStatus.classList.add('error');
  } finally {
    resourceRetry.disabled = false;
    renderActivities();
    renderDashboard();
    renderTimeValue();
  }
}

resourceRetry.addEventListener('click', loadResources);

// --------------------------------------------------
// 5. 크루 참여·직접 만들기·오늘 인증 (DAY 13~16, 20)
// --------------------------------------------------
function toggleCrew(crewId) {
  const isJoined = state.joinedCrews.includes(crewId);
  state.joinedCrews = isJoined
    ? state.joinedCrews.filter((id) => id !== crewId)
    : state.joinedCrews.concat(crewId);
  writeStorage(STORAGE_KEYS.joinedCrews, state.joinedCrews);
  renderCrews();
}

function checkinCrew(crewId) {
  if (!state.joinedCrews.includes(crewId)) {
    setMessage(crewMessage, '먼저 크루에 참여해 주세요.');
    return;
  }
  if (!state.crewCheckins[crewId]) state.crewCheckins[crewId] = {};
  state.crewCheckins[crewId][getTodayKey()] = true;
  writeStorage(STORAGE_KEYS.crewCheckins, state.crewCheckins);
  renderCrews();
}

function cheerCrew(crewId) {
  state.crewCheers[crewId] = safeNumber(state.crewCheers[crewId], 0) + 1;
  writeStorage(STORAGE_KEYS.crewCheers, state.crewCheers);
  renderCrews();
}

showCrewFormButton.addEventListener('click', () => {
  crewForm.hidden = !crewForm.hidden;
  if (!crewForm.hidden) crewNameInput.focus();
});

cancelCrewFormButton.addEventListener('click', () => {
  crewForm.reset();
  crewForm.hidden = true;
  setMessage(crewMessage, '');
});

crewForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = crewNameInput.value.trim();
  const goal = crewGoalInput.value.trim();
  const duration = safeNumber(crewDurationSelect.value, 7);
  if (title.length < 2 || goal.length < 3) {
    setMessage(crewMessage, '크루 이름과 목표를 조금 더 구체적으로 적어주세요.');
    return;
  }
  const crew = {
    id: `custom-${createPostId()}`,
    label: `${duration} DAYS · MEMBER CREW`,
    title,
    description: '멤버가 직접 만든 크루입니다. 서로의 진행 상황을 공유하고 응원해요.',
    goal,
    tone: 'blue',
    duration,
    participants: 0,
    todayCount: 0,
    isCustom: true
  };
  state.customCrews.unshift(crew);
  state.joinedCrews.push(crew.id);
  writeStorage(STORAGE_KEYS.customCrews, state.customCrews);
  writeStorage(STORAGE_KEYS.joinedCrews, state.joinedCrews);
  crewForm.reset();
  crewForm.hidden = true;
  setMessage(crewMessage, '새 크루를 만들었어요. 오늘 첫 인증을 남겨보세요!', 'success');
  renderCrews();
});

// --------------------------------------------------
// 6. 커뮤니티 인증·필터·응원·댓글·공유 (DAY 13~16, 20)
// --------------------------------------------------
const savedDraft = readSession(SESSION_KEYS.postDraft, '');
if (savedDraft) postContentInput.value = savedDraft;
postContentInput.addEventListener('input', () => writeSession(SESSION_KEYS.postDraft, postContentInput.value));

feedFilters.addEventListener('click', (event) => {
  const button = event.target.closest('[data-feed-filter]');
  if (!button) return;
  state.communityFilter = button.dataset.feedFilter;
  feedFilters.querySelectorAll('[data-feed-filter]').forEach((item) => {
    const isActive = item === button;
    item.classList.toggle('active', isActive);
    item.setAttribute('aria-pressed', String(isActive));
  });
  renderFeed();
});

postForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const nickname = postNicknameInput.value.trim();
  const content = postContentInput.value.trim();
  if (nickname.length === 0) {
    setMessage(postMessage, '닉네임을 입력해 주세요.');
    postNicknameInput.focus();
    return;
  }
  if (content.length < 2) {
    setMessage(postMessage, '나누고 싶은 이야기를 두 글자 이상 적어 주세요.');
    postContentInput.focus();
    return;
  }
  const post = {
    id: createPostId(),
    nickname,
    content,
    type: postTypeSelect.value,
    activity: postActivitySelect.value,
    likes: 0,
    meToo: 0,
    comments: [],
    createdAt: '방금 전',
    createdAtNumber: Date.now(),
    demo: false
  };
  state.posts.unshift(post);
  savePosts();
  postContentInput.value = '';
  writeSession(SESSION_KEYS.postDraft, '');
  setMessage(postMessage, '나의 리셋 인증을 남겼어요. 작은 실천도 누군가에게 힘이 됩니다.', 'success');
  state.communityFilter = 'all';
  feedFilters.querySelectorAll('[data-feed-filter]').forEach((button) => {
    const active = button.dataset.feedFilter === 'all';
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  renderFeed();
  renderStoryPreview();
});

function togglePostReaction(postId, reactionType) {
  const post = state.posts.find((item) => item.id === postId);
  if (!post) return;
  if (!state.postReactions[postId]) state.postReactions[postId] = {};
  const alreadyReacted = Boolean(state.postReactions[postId][reactionType]);
  state.postReactions[postId][reactionType] = !alreadyReacted;
  const field = reactionType === 'meToo' ? 'meToo' : 'likes';
  post[field] = Math.max(0, safeNumber(post[field], 0) + (alreadyReacted ? -1 : 1));
  writeStorage(STORAGE_KEYS.postReactions, state.postReactions);
  savePosts();
  renderFeed();
  renderStoryPreview();
}

function deletePost(postId) {
  const post = state.posts.find((item) => item.id === postId);
  if (!post || post.demo) return;
  if (!confirm('이 기록을 삭제할까요?')) return;
  state.posts = state.posts.filter((item) => item.id !== postId);
  delete state.postReactions[postId];
  state.expandedComments = state.expandedComments.filter((id) => id !== postId);
  writeStorage(STORAGE_KEYS.postReactions, state.postReactions);
  savePosts();
  renderFeed();
  renderStoryPreview();
}

// 되찾을 시간 계산기
savedTimeSelect.addEventListener('change', renderTimeValue);
useTimeGoalButton.addEventListener('click', useTimeValueForChallenge);

// --------------------------------------------------
// 7. 모바일 내비게이션 (DAY 16)
// --------------------------------------------------
menuToggle.addEventListener('click', () => {
  state.menuOpen = !state.menuOpen;
  mainNav.classList.toggle('open', state.menuOpen);
  menuToggle.setAttribute('aria-expanded', String(state.menuOpen));
  menuToggle.setAttribute('aria-label', state.menuOpen ? '메뉴 닫기' : '메뉴 열기');
});

mainNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    state.menuOpen = false;
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '메뉴 열기');
  });
});

// --------------------------------------------------
// 8. 첫 화면 렌더링
// --------------------------------------------------
renderTimeValue();
renderAll();
loadResources();
