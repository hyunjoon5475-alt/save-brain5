import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const copy = (from, to) => {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  console.log(`copied ${path.relative(root, from)} -> ${path.relative(root, to)}`);
};

const androidRoot = path.join(root, 'android', 'app', 'src', 'main');
if (!fs.existsSync(path.join(root, 'android'))) {
  console.warn('Android project not found. Run: npx cap add android');
} else {
  const javaSource = path.join(root, 'native', 'android', 'app', 'src', 'main', 'java', 'com', 'savebrain', 'app');
  const javaTarget = path.join(androidRoot, 'java', 'com', 'savebrain', 'app');
  for (const file of ['MainActivity.java', 'SaveBrainScreenTimePlugin.java', 'FocusAccessibilityService.java', 'FocusShieldActivity.java']) {
    copy(path.join(javaSource, file), path.join(javaTarget, file));
  }
  copy(
    path.join(root, 'native', 'android', 'app', 'src', 'main', 'res', 'xml', 'save_brain_accessibility_service.xml'),
    path.join(androidRoot, 'res', 'xml', 'save_brain_accessibility_service.xml')
  );

  const values = path.join(androidRoot, 'res', 'values', 'strings.xml');
  fs.mkdirSync(path.dirname(values), { recursive: true });
  if (!fs.existsSync(values)) fs.writeFileSync(values, '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n</resources>\n');
  let strings = fs.readFileSync(values, 'utf8');
  if (!strings.includes('save_brain_accessibility_description')) {
    strings = strings.replace('</resources>', '    <string name="save_brain_accessibility_description">선택한 앱이 화면에 열렸는지 확인하고, 하루 사용 한도에 도달한 경우 OFFROOM 휴식 화면을 표시합니다. 화면 내용이나 입력 내용은 읽지 않습니다.</string>\n</resources>');
    fs.writeFileSync(values, strings);
  }

  const manifestPath = path.join(androidRoot, 'AndroidManifest.xml');
  let manifest = fs.readFileSync(manifestPath, 'utf8');
  if (!manifest.includes('android.permission.PACKAGE_USAGE_STATS')) {
    manifest = manifest.replace('<application', '    <uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" />\n\n    <queries>\n        <intent>\n            <action android:name="android.intent.action.MAIN" />\n            <category android:name="android.intent.category.LAUNCHER" />\n        </intent>\n    </queries>\n\n    <application');
  }
  if (!manifest.includes('FocusShieldActivity')) {
    manifest = manifest.replace('</application>', `
        <activity
            android:name="com.savebrain.app.FocusShieldActivity"
            android:exported="false"
            android:excludeFromRecents="true"
            android:launchMode="singleTask" />

        <service
            android:name="com.savebrain.app.FocusAccessibilityService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:exported="true"
            android:label="OFFROOM 집중 모드">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/save_brain_accessibility_service" />
        </service>
    </application>`);
  }
  fs.writeFileSync(manifestPath, manifest);
  console.log(`merged Android permission, package query, focus activity and service into ${path.relative(root, manifestPath)}`);
}

const iosApp = path.join(root, 'ios', 'App', 'App');
if (!fs.existsSync(iosApp)) {
  console.warn('iOS project not found. Run: npx cap add ios');
} else {
  copy(path.join(root, 'native', 'ios', 'App', 'SaveBrainAppGroup.swift'), path.join(iosApp, 'SaveBrainAppGroup.swift'));
  copy(path.join(root, 'native', 'ios', 'App', 'SaveBrainScreenTimePlugin.swift'), path.join(iosApp, 'SaveBrainScreenTimePlugin.swift'));
  copy(path.join(root, 'native', 'ios', 'App', 'MainViewController.swift'), path.join(iosApp, 'MainViewController.swift'));
}

for (const folder of ['SaveBrainMonitor', 'SaveBrainReport']) {
  const source = path.join(root, 'native', 'ios', folder);
  const target = path.join(root, 'ios', folder);
  fs.mkdirSync(target, { recursive: true });
  for (const file of fs.readdirSync(source)) {
    copy(path.join(source, file), path.join(target, file));
  }
}

console.log('\nNative source files are in place. Follow README.md to add the two iOS extension targets and entitlements in Xcode.');
