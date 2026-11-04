import { Capacitor, registerPlugin } from '@capacitor/core';

const SaveBrainScreenTime = registerPlugin('SaveBrainScreenTime');
const platform = Capacitor.getPlatform();
const isNative = Capacitor.isNativePlatform();

const el = (id) => document.getElementById(id);
const state = {
  selectedPackages: [],
  apps: [],
  status: null
};

function setText(id, text) {
  const node = el(id);
  if (node) node.textContent = text;
}

function setStatus(message, isError = false) {
  const node = el('native-limit-status');
  if (!node) return;
  node.textContent = message;
  node.dataset.state = isError ? 'error' : 'ok';
}

function prettyMinutes(value) {
  const minutes = Math.max(0, Math.round(Number(value) || 0));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${hours}시간 ${rest}분` : `${rest}분`;
}

function renderAppOptions(apps) {
  const container = el('android-app-list');
  if (!container) return;
  container.replaceChildren();
  apps.forEach((app) => {
    const label = document.createElement('label');
    label.className = 'device-app-option';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = app.packageName;
    checkbox.checked = state.selectedPackages.includes(app.packageName);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked && !state.selectedPackages.includes(app.packageName)) {
        state.selectedPackages.push(app.packageName);
      } else if (!checkbox.checked) {
        state.selectedPackages = state.selectedPackages.filter((name) => name !== app.packageName);
      }
      setText('selected-app-count', `${state.selectedPackages.length}개`);
    });
    const text = document.createElement('span');
    text.textContent = app.label || app.packageName;
    const small = document.createElement('small');
    small.textContent = app.packageName;
    text.appendChild(small);
    label.append(checkbox, text);
    container.appendChild(label);
  });
}

function renderUsage(apps, totalMinutes) {
  const list = el('native-usage-list');
  if (!list) return;
  list.replaceChildren();
  if (!Array.isArray(apps) || apps.length === 0) {
    setText('native-usage-summary', '표시할 사용 기록이 없습니다. 사용 시간 권한과 오늘 앱 사용 여부를 확인해 주세요.');
    return;
  }
  const max = Math.max(1, ...apps.map((app) => Number(app.minutes) || 0));
  apps.slice(0, 12).forEach((app) => {
    const row = document.createElement('div');
    row.className = 'device-usage-row';
    const name = document.createElement('span');
    name.textContent = app.label || app.packageName || '앱';
    const time = document.createElement('strong');
    time.textContent = prettyMinutes(app.minutes);
    const packageName = document.createElement('small');
    packageName.textContent = app.packageName || '';
    const bar = document.createElement('div');
    bar.className = 'device-usage-bar';
    const fill = document.createElement('span');
    fill.style.width = `${Math.min(100, (Number(app.minutes) / max) * 100)}%`;
    bar.appendChild(fill);
    row.append(name, time, packageName, bar);
    list.appendChild(row);
  });
  setText('native-usage-summary', `오늘 확인된 앱 사용 시간 합계: ${prettyMinutes(totalMinutes)} · 사용 시간이 긴 앱부터 표시합니다.`);
}

async function refreshStatus() {
  if (!isNative) return null;
  try {
    const status = await SaveBrainScreenTime.checkStatus();
    state.status = status;
    if (platform === 'android' && Array.isArray(status.selectedPackages)) {
      state.selectedPackages = status.selectedPackages;
    }
    setText('usage-permission-status', status.usageAccess || status.authorized ? '허용됨' : '허용 필요');
    setText('selected-app-count', `${status.selectedCount || state.selectedPackages.length}개`);
    setText('native-platform-note', platform === 'ios'
      ? 'iPhone: Apple Screen Time 권한을 요청하고, 시스템 앱 선택창으로 제한할 앱을 고릅니다.'
      : 'Android: 사용정보 접근과 접근성 서비스를 각각 직접 허용해야 합니다. 접근성 동의 안내를 먼저 확인해 주세요.');
    if (platform === 'android') {
      const panel = el('android-accessibility-panel');
      if (panel) panel.hidden = false;
      setText('native-limit-status', status.focusAccess ? '접근성 서비스가 켜져 있습니다.' : '앱 제한을 사용하려면 접근성 설정에서 OFFROOM을 켜 주세요.');
    }
    return status;
  } catch (error) {
    setStatus(`권한 상태를 확인하지 못했습니다: ${error.message || error}`, true);
    return null;
  }
}

async function loadUsage() {
  if (!isNative) return;
  try {
    if (platform === 'ios') {
      await SaveBrainScreenTime.showUsageReport();
      return;
    }
    const result = await SaveBrainScreenTime.getUsageStats();
    renderUsage(result.apps || [], result.totalMinutes || 0);
  } catch (error) {
    setStatus(`사용 시간을 불러오지 못했습니다: ${error.message || error}`, true);
  }
}

async function init() {
  const note = el('native-platform-note');
  const controls = [
    'request-usage-permission', 'refresh-usage', 'select-native-apps',
    'start-native-limit', 'stop-native-limit', 'open-native-report',
    'request-accessibility-permission'
  ];
  if (!isNative) {
    if (note) note.textContent = '현재 웹 미리보기 상태입니다. 실제 권한 화면과 앱 사용 시간은 Capacitor로 빌드한 iOS·Android 앱에서만 확인할 수 있습니다.';
    controls.forEach((id) => { const button = el(id); if (button) button.disabled = true; });
    return;
  }

  await refreshStatus();

  el('request-usage-permission')?.addEventListener('click', async () => {
    try {
      if (platform === 'ios') await SaveBrainScreenTime.requestAuthorization();
      else await SaveBrainScreenTime.requestUsageAccess();
      await refreshStatus();
      setStatus('사용 시간 권한 상태를 확인했습니다.');
    } catch (error) {
      setStatus(`권한 요청이 완료되지 않았습니다: ${error.message || error}`, true);
    }
  });

  el('refresh-usage')?.addEventListener('click', loadUsage);
  el('open-native-report')?.addEventListener('click', loadUsage);

  el('select-native-apps')?.addEventListener('click', async () => {
    try {
      if (platform === 'ios') {
        const result = await SaveBrainScreenTime.selectApps();
        setText('selected-app-count', `${result.selectedCount || 0}개`);
        setStatus('Apple 시스템 앱 선택창에서 선택 내용을 저장했습니다.');
      } else {
        const result = await SaveBrainScreenTime.listApps();
        state.apps = result.apps || [];
        if (!state.apps.length) throw new Error('선택 가능한 앱 목록이 없습니다. 앱 권한과 기기 설정을 확인해 주세요.');
        renderAppOptions(state.apps);
        const picker = el('android-app-picker');
        if (picker) picker.hidden = false;
      }
    } catch (error) {
      setStatus(`앱 선택을 열지 못했습니다: ${error.message || error}`, true);
    }
  });

  el('save-android-apps')?.addEventListener('click', () => {
    setText('selected-app-count', `${state.selectedPackages.length}개`);
    const picker = el('android-app-picker');
    if (picker) picker.hidden = true;
    setStatus(state.selectedPackages.length ? '선택한 앱을 저장할 준비가 됐습니다.' : '앱을 하나 이상 선택해 주세요.', !state.selectedPackages.length);
  });

  el('request-accessibility-permission')?.addEventListener('click', async () => {
    const consent = el('accessibility-consent');
    if (!consent?.checked) {
      setStatus('접근성 서비스의 목적과 확인하는 정보를 읽고 동의 체크를 해 주세요.', true);
      return;
    }
    try {
      await SaveBrainScreenTime.requestFocusAccess();
      await refreshStatus();
      setStatus('접근성 설정에서 OFFROOM을 켠 뒤 앱으로 돌아와 주세요.');
    } catch (error) {
      setStatus(`접근성 설정을 열지 못했습니다: ${error.message || error}`, true);
    }
  });

  el('start-native-limit')?.addEventListener('click', async () => {
    try {
      const minutes = Number(el('native-daily-limit')?.value || 30);
      if (platform === 'android') {
        if (!state.selectedPackages.length) throw new Error('먼저 제한할 앱을 선택해 주세요.');
        if (!state.status?.usageAccess) throw new Error('먼저 사용 시간 접근 권한을 허용해 주세요.');
        if (!state.status?.focusAccess) throw new Error('접근성 설정에서 OFFROOM을 먼저 켜 주세요.');
        await SaveBrainScreenTime.startLimit({ packages: state.selectedPackages, minutes });
      } else {
        if (!state.status?.authorized) throw new Error('먼저 Screen Time 권한을 허용해 주세요.');
        await SaveBrainScreenTime.startLimit({ minutes });
      }
      setStatus(`집중 모드를 시작했습니다. 선택한 앱의 하루 한도는 ${prettyMinutes(minutes)}입니다.`);
      await refreshStatus();
    } catch (error) {
      setStatus(`집중 모드를 시작하지 못했습니다: ${error.message || error}`, true);
    }
  });

  el('stop-native-limit')?.addEventListener('click', async () => {
    try {
      await SaveBrainScreenTime.stopLimit();
      setStatus('집중 모드를 해제했습니다.');
      await refreshStatus();
    } catch (error) {
      setStatus(`집중 모드를 해제하지 못했습니다: ${error.message || error}`, true);
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshStatus();
  });
}

init();
