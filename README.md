# OFFROOM — 디지털 웰빙 커뮤니티 MVP

`OFFROOM`은 기존 HTML/CSS/JavaScript 화면을 Capacitor 앱으로 감싸고, 기기별 Screen Time API를 네이티브 플러그인으로 연결하는 출발 프로젝트입니다.

## 이번 버전에서 시작한 기능

### 공통 화면
- 기존 OFFROOM 웹 화면 유지
- 기기 사용 관리 섹션 추가
- OS 권한 상태, 앱 선택, 일일 한도, 사용 리포트 버튼 추가
- 권한을 거부한 경우에도 기존 챌린지와 직접 기록 기능은 계속 사용 가능

### iPhone (iOS)
- Apple `FamilyControls`를 통한 본인 기기 권한 요청 (`AuthorizationCenter`의 individual authorization)
- Apple `FamilyActivityPicker` 시스템 화면에서 제한할 앱 선택
- `DeviceActivityCenter`로 하루 사용 한도 모니터링
- `DeviceActivityMonitor` 확장 프로그램에서 한도 도달 시 `ManagedSettingsStore`로 선택 앱 Shield 적용
- `DeviceActivityReport` 확장 프로그램에서 선택 앱들의 오늘 사용 시간 리포트 표시
- 집중 모드 해제 시 모니터링과 Shield 해제

### Android
- `UsageStatsManager`를 통한 오늘 앱별 foreground 사용 시간 조회
- Android의 `ACTION_USAGE_ACCESS_SETTINGS` 설정 화면으로 사용정보 접근 허용 안내
- 실행 가능한 앱 목록에서 제한할 앱 선택
- 앱별 사용 시간을 합산해 일일 한도 계산
- 사용자가 명시적으로 동의하고 Android 접근성 설정에서 서비스를 켠 경우, 한도에 도달한 선택 앱 위에 OFFROOM 휴식 화면 표시
- Android 설정에서 사용자가 접근성 서비스를 언제든 끌 수 있도록 제공

## 커뮤니티 v2 — 목표 중심 리셋 크루

이번 업데이트에서 커뮤니티를 일반 게시판이 아니라 **같은 목표를 일정 기간 함께 실천하는 모임**으로 재구성했습니다. 회의에서 나온 아이디어를 다음처럼 반영했습니다.

- **목표 중심 크루**: 쇼츠 줄이기, 잠들기 전 화면 OFF, 하루 한 페이지 읽기, 퇴근 후 화면 OFF처럼 기간과 실천 목표가 분명한 크루를 제공합니다.
- **함께하는 현황**: 크루별 참여 인원, 오늘 인증 인원, 진행 막대를 표시합니다. 현재 인원 수는 화면 시연용 예시 데이터입니다.
- **사용자 주도 모임**: 사용자가 직접 크루 이름·목표·기간을 만들어 참여할 수 있습니다.
- **일상 인증과 대체 활동**: 실천 인증, 독서·산책·음악·공연·대화 등 화면 밖 활동, 달라진 일상, 응원 메시지를 분류해 올립니다.
- **상호작용**: '응원해요', '나도 해볼게요', 댓글, 크루 응원, SNS 공유 기능을 넣었습니다.
- **기록 연결**: 개인 챌린지의 일일 기록을 커뮤니티에 바로 공유할 수 있습니다.
- **안전한 분위기**: 실패를 비난하지 않고 다시 시작하도록 응원하는 문구와 규칙을 표시합니다.

### 여러 사람이 실제로 함께 쓰려면

현재 커뮤니티의 게시글·댓글·응원·크루 가입 정보는 `localStorage`에 저장됩니다. 따라서 지금은 **같은 브라우저 안에서 기능을 시연하는 프론트엔드 프로토타입**입니다. 다른 사람이 다른 휴대전화나 컴퓨터에서 작성한 내용이 이 화면에 실시간으로 나타나지는 않습니다.

실제 공개 서비스로 운영하기 전에는 다음 연결이 필요합니다.

1. 회원 계정과 닉네임
2. 클라우드 데이터베이스(크루·가입·인증·게시글·댓글·반응)
3. 새 글과 댓글의 실시간 업데이트
4. 게시글 신고·차단·관리자 조치 및 개인정보 삭제 기능
5. 크루 알림과 푸시 알림(사용자 동의 기반)

즉, 이번 버전은 팀 회의에서 합의한 핵심 이용 경험을 먼저 검토하는 단계이고, 실제 다중 사용자 커뮤니티는 서버와 계정 기능을 연결해야 완성됩니다.

## 중요한 플랫폼 차이

- iOS는 Apple Screen Time API의 시스템 Shield를 사용하므로 운영체제가 제공하는 앱 차단 화면이 적용됩니다.
- Android의 `UsageStatsManager`는 사용 시간 조회 API이지, 다른 앱을 정지시키는 API가 아닙니다. 이 시작 버전은 접근성 서비스가 현재 열린 앱의 패키지 식별자와 사용 시간만 확인하고, 한도에 도달하면 자체 휴식 화면을 표시합니다. 기기 관리자가 제공하는 시스템 수준의 앱 정지와 동일하지 않으며, 서비스가 꺼지거나 기기 제조사 동작이 다르면 제한이 적용되지 않을 수 있습니다.
- Android 접근성 서비스는 Google Play 정책상 민감한 API입니다. 스토어 배포 전에 앱 안의 눈에 띄는 공개와 적극적 동의, Play Console 접근성 API 선언 및 심사 요건을 확인해야 합니다. `isAccessibilityTool=true`로 선언하지 않습니다. 장애 지원 앱이 아니기 때문입니다. Google Play가 이 사용 사례를 승인한다고 보장할 수 없습니다.
- iOS Screen Time 기능은 Xcode에서 Family Controls 권한과 관련 확장 타깃을 구성해야 합니다. App Store 배포 전에는 Apple Developer Account에서 Family Controls 배포 entitlement 승인을 요청해야 합니다.
- iOS 사용 리포트는 Apple의 개인정보 보호형 Device Activity Report 확장 안에서 표시합니다. 리포트 원본 데이터를 JavaScript나 외부 서버로 복사하지 않습니다.
- 실제 iOS/Android 기기에서 권한 화면과 차단 동작을 실행 검증하지는 않았습니다. 이 작업 환경에는 Xcode와 Android SDK가 없어 `.ipa`/`.aab` 빌드를 만들 수 없습니다.

## 준비 환경

Capacitor 8 기준:
- Node.js 22 이상
- iOS 빌드: macOS + Xcode 26 이상
- Android 빌드: Android Studio 2025.2.1 이상 + Android SDK

## 1. 공통 설치

Mac 터미널에서 프로젝트 폴더로 이동합니다.

```bash
npm install
npm run dev
```

브라우저에서 화면만 먼저 확인하려면 Vite 주소를 열면 됩니다. 이 웹 미리보기에서는 네이티브 권한 버튼이 비활성화되고, OS 권한 화면은 열리지 않습니다. 앱 빌드를 위해서는 `npm run build`를 실행합니다.

## 2. 네이티브 프로젝트 생성

각 플랫폼을 처음 한 번 생성합니다.

```bash
npx cap add ios
npx cap add android
```

## 3. 네이티브 소스 복사 및 Android 설정 병합

```bash
node scripts/install-native-files.mjs
npm run cap:sync
```

스크립트는 Android Java 플러그인, 접근성 서비스, 휴식 화면, Manifest 권한/서비스 등록을 복사합니다. iOS 플러그인과 Xcode 확장 프로그램의 소스·템플릿도 복사합니다.

## 4. Android Studio에서 확인

```bash
npx cap open android
```

- `applicationId`/namespace가 `com.savebrain.app`인지 확인합니다.
- 실제 Android 기기에서 앱을 실행합니다.
- OFFROOM의 `기기 사용 관리` 화면에서 `사용 시간 접근 허용`을 누릅니다.
- Android 설정의 사용정보 접근 목록에서 OFFROOM을 허용합니다.
- 제한할 앱을 고르고 일일 한도를 설정합니다.
- 화면의 접근성 서비스 설명과 동의 체크를 확인한 뒤 `Android 접근성 설정 열기`를 누릅니다.
- 접근성 메뉴에서 `OFFROOM 집중 모드`를 직접 켭니다.
- 앱으로 돌아와 `집중 모드 시작`을 누릅니다.

Android 설정 화면의 메뉴 이름은 제조사와 OS 버전에 따라 다를 수 있습니다. 앱을 제한하는 접근성 서비스는 언제든 사용자가 설정에서 끌 수 있습니다.

## 5. Xcode에서 iOS 타깃과 권한 구성

```bash
npx cap open ios
```

1. App 타깃의 iOS Deployment Target을 16.0 이상으로 설정합니다.
2. App 타깃의 Signing & Capabilities에 **Family Controls**와 **App Groups**를 추가합니다.
3. App Group 식별자를 `group.com.savebrain.app`으로 설정합니다. 실제 앱의 팀/번들 ID에 맞춰 바꿔도 되지만, Swift 소스와 모든 타깃에서 같은 값을 사용해야 합니다.
4. `native/ios/App/App.entitlements.template`을 App 타깃의 `App.entitlements`로 복사하고 Xcode의 Code Signing Entitlements에 연결합니다.
5. File → New → Target에서 **Device Activity Monitor Extension**을 추가합니다. 생성된 타깃에 `native/ios/SaveBrainMonitor/SaveBrainMonitorExtension.swift`를 포함하고, Info.plist 템플릿 내용과 entitlement 템플릿을 해당 타깃에 적용합니다.
6. File → New → Target에서 **Device Activity Report Extension**을 추가합니다. 생성된 타깃에 `native/ios/SaveBrainReport/SaveBrainReportExtension.swift`를 포함하고, Info.plist 템플릿 내용과 entitlement 템플릿을 해당 타깃에 적용합니다.
7. App, Monitor Extension, Report Extension 모두 동일한 App Group을 사용하도록 설정합니다.
8. Monitor 및 Report Extension의 Bundle Identifier는 App Bundle Identifier의 하위 식별자로 설정합니다.
9. `MainViewController.swift`가 App 타깃에 포함되어 있고 `SaveBrainScreenTimePlugin.swift`, `SaveBrainAppGroup.swift`가 App 타깃에 포함되어 있는지 확인합니다.
10. 실제 iPhone에서 실행하고 `기기 사용 관리` → `사용 시간 접근 허용`을 눌러 OS 인증 화면을 확인합니다. 선택 앱을 지정하고 한도를 낮게 설정해 테스트합니다.

Apple의 Family Controls 배포 entitlement는 App Store 배포 전에 Apple Developer 계정에서 앱 타깃과 관련 Screen Time 확장 타깃용으로 요청해야 합니다.

## 6. 실행·동기화 명령

웹 파일을 바꾼 뒤에는 항상 빌드와 동기화를 다시 실행합니다.

```bash
npm run cap:sync
```

그다음 Xcode 또는 Android Studio에서 앱을 다시 실행합니다.

## 파일 구조

```text
offroom/
├── index.html
├── style.css
├── app.js
├── native-bridge.js
├── package.json
├── capacitor.config.ts
├── vite.config.js
├── public/data/
├── scripts/install-native-files.mjs
└── native/
    ├── android/
    │   ├── AndroidManifest.additions.xml
    │   └── app/src/main/java/com/savebrain/app/
    └── ios/
        ├── App/
        ├── SaveBrainMonitor/
        └── SaveBrainReport/
```

## 개인정보·안전 안내

- 사용 시간 데이터는 기기에서 처리합니다. 이 시작 버전은 사용 시간 기록을 외부 서버로 전송하지 않습니다.
- Android 접근성 서비스는 현재 열린 앱의 패키지 식별자만 확인합니다. 화면 본문, 입력 내용, 채팅, 비밀번호를 읽도록 설정하지 않았습니다.
- Android의 접근성 동의가 없으면 앱 제한 기능을 시작하지 않습니다.
- 사용자는 OS 설정에서 언제든 사용정보 접근 및 접근성 권한을 취소할 수 있습니다.
- 이 기능은 사용 습관을 관리하는 도구이지 의료·정신건강 진단 기능이 아닙니다.
- 실제 서비스 공개 전 개인정보처리방침, 데이터 보존 기간, 계정 삭제/데이터 삭제, 커뮤니티 신고·차단 및 안전 운영 정책을 별도로 마련해야 합니다.

## 검증 상태

- 기존 웹 JavaScript 파일의 구문 검사 대상
- 신규 네이티브 브리지 JavaScript 구문 검사 대상
- Android Java / iOS Swift는 해당 개발 도구체인이 없는 환경에서 작성한 시작 소스입니다. Xcode와 Android Studio에서 컴파일·실기기 테스트가 반드시 필요합니다.


## 최신 기획 반영: 결과 중심 랜딩 페이지

이번 업데이트는 새 기능을 많이 늘리기보다 팀 회의에서 정한 사용 흐름을 앞쪽에 배치했습니다.

- 첫 화면의 주요 동선을 `변화 이야기 둘러보기 → 되찾을 시간 계산 → 챌린지 설정` 순서로 정리했습니다.
- 하루에 줄일 시간을 선택하면 주간·30일·연간 환산치를 계산합니다. 이는 실제 사용자 성과가 아닌 단순 산술 예시로 표시합니다.
- 선택한 시간 범위에 맞춰 독서·산책·음악·기록 등 대체 활동을 제안합니다.
- 변화 이야기 미리보기는 게시글 데이터에서 가져오며, 샘플 게시글은 `화면 예시`, 직접 작성한 로컬 게시글은 `내 브라우저 기록`으로 표시합니다.
- 실제 후기와 참여 통계는 팀원들이 2~3일 테스트하고 공개 동의를 받은 뒤 반영하도록 안내합니다. 확인되지 않은 참여자 수는 표시하지 않습니다.
- 챌린지 기간이 끝나거나 목표를 달성하면 같은 목표를 다음 기간으로 이어갈 수 있습니다.
- 초반 타깃은 취업·시험 준비 중이거나 퇴근 후 영상 사용을 줄이고 싶거나, 휴대폰 대신 취미를 찾으려는 사람으로 구체화했습니다.

현재 커뮤니티 게시글·후기·크루 기록은 브라우저 로컬 저장 상태입니다. 실제 여러 사용자가 같은 게시글·응원·참여 현황을 공유하려면 인증과 공용 데이터베이스 연결이 별도로 필요합니다.


## OFFROOM 최신 회의 반영 (2026-11-04)

- 공개 브랜드를 OFFROOM으로 정리했습니다. Capacitor 내부 Android applicationId와 Java 패키지 경로(`com.savebrain.app`)는 기존 네이티브 프로젝트 호환성을 위해 유지합니다.
- 메인 화면 흐름을 `변화 이야기 → 되찾을 시간 계산 → 대체 활동 → 챌린지` 순서로 정리했습니다.
- 메인 일러스트 크기를 약 12% 축소하고 Pretendard + Gowun Dodum 글꼴, 크림·베이지·브라운·세이지·살구 포인트 컬러를 적용했습니다.
- 챌린지 기간은 3일·7일·30일을 제공하고, 기본 선택은 7일로 변경했습니다.
- 샘플 후기에는 `화면 예시` 표시를 유지하고, 예시 게시물의 임의 반응 수와 상대 시간 표시는 실제 활동 데이터처럼 보이지 않도록 조정했습니다.
- 크루 샘플의 가상 참여 인원·인증 숫자를 제거하고 공용 집계 전 상태를 표시합니다.
- 개인 사용 기록과 커뮤니티 글은 여전히 브라우저 로컬 저장 방식입니다. 여러 기기에서 실제로 공유하려면 Supabase 등의 인증·공용 데이터베이스 연결이 필요합니다.

브랜드 이름 변경과 별개로 iOS/Android 네이티브 권한 및 차단 기능은 실제 Xcode·Android Studio 기기 빌드와 권한 테스트가 필요합니다. 이번 변경은 웹 화면과 사용자 경험 중심이며, 네이티브 빌드 완료를 의미하지 않습니다.


## 2026-11-04 컬러 톤 업데이트
- 기존 크림·베이지·브라운 정체성은 유지하면서 배경과 카드 색상을 한 단계 밝게 조정했습니다.
- 포인트 컬러를 부드러운 살구 오렌지, 세이지 그린, 파스텔 옐로우로 밝게 조정했습니다.
- 밝아진 포인트 배경 위의 글자는 짙은 잉크 색상으로 바꿔 가독성을 유지했습니다.
- 주요 버튼의 브라운은 흰색 글자와 충분한 대비를 확보하는 범위에서만 밝게 조정했습니다.

## GitHub Pages 자동 배포

이 프로젝트는 Vite로 빌드한 `dist/` 폴더를 GitHub Pages에 배포합니다. 저장소 이름이 URL 경로에 포함되는 프로젝트 페이지에서도 정적 파일과 JSON 경로가 맞도록 `vite.config.js`의 `base: './'`를 사용합니다. 이 설정은 Capacitor의 `dist` 웹 자산에도 상대 경로를 적용합니다.

### 저장소에서 최초 1회 설정

1. GitHub 저장소의 **Settings → Pages**로 이동합니다.
2. **Build and deployment → Source**에서 **GitHub Actions**를 선택합니다.
3. 기본 브랜치가 `main` 또는 `master`인지 확인합니다. 현재 워크플로는 두 브랜치에 푸시될 때 실행됩니다.
4. 변경사항을 커밋하고 푸시합니다.

### 이후 배포 방법

코드를 수정한 뒤 VS Code에서 커밋하고 다음 명령으로 푸시합니다.

```bash
git add .
git commit -m "Update OFFROOM"
git push origin main
```

브랜치가 `master`라면 마지막 명령의 `main`을 `master`로 바꾸세요. 푸시 후 GitHub 저장소의 **Actions** 탭에서 `Deploy OFFROOM to GitHub Pages` 실행을 확인할 수 있습니다. 빌드가 성공하면 `github-pages` 환경에 배포 주소가 표시됩니다.

### 로컬에서 배포 빌드 확인

```bash
npm install
npm run build
```

빌드 결과는 `dist/`에 생성됩니다. GitHub Actions가 이 폴더를 자동 배포하므로 `dist/` 폴더를 직접 커밋할 필요는 없습니다. `.gitignore`에 따라 `dist/`와 `node_modules/`는 저장소에서 제외됩니다.

### 배포 문제 확인

- Actions 실행이 실패하면 해당 실행을 열어 `Build OFFROOM` 또는 `Verify build output` 단계의 오류를 확인합니다.
- Settings → Pages의 Source가 **GitHub Actions**인지 확인합니다.
- `main`/`master`가 아닌 브랜치에 푸시했다면 워크플로의 `branches` 목록에 해당 브랜치를 추가하거나 기본 브랜치로 푸시하세요.
- 배포 직후 이전 화면이 보이면 브라우저에서 강력 새로고침을 합니다.

GitHub에 커밋하거나 푸시하는 동작만으로는 사이트가 자동으로 게시되지 않습니다. 저장소의 Pages 설정과 위 배포 워크플로가 함께 필요합니다.
