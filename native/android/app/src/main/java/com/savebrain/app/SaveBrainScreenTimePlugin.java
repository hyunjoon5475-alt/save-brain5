package com.savebrain.app;

import android.app.AppOpsManager;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.os.Build;
import android.provider.Settings;

import com.getcapacitor.ActivityCallback;
import com.getcapacitor.ActivityResult;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@CapacitorPlugin(name = "SaveBrainScreenTime")
public class SaveBrainScreenTimePlugin extends Plugin {
    private static final String PREFS = "save_brain_focus";
    private static final String KEY_PACKAGES = "blocked_packages";
    private static final String KEY_LIMIT = "daily_limit_minutes";
    private static final String KEY_ENABLED = "focus_enabled";

    private boolean hasUsageAccess() {
        AppOpsManager appOps = (AppOpsManager) getContext().getSystemService(android.content.Context.APP_OPS_SERVICE);
        if (appOps == null) return false;
        int mode;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            mode = appOps.unsafeCheckOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS,
                    android.os.Process.myUid(), getContext().getPackageName());
        } else {
            mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS,
                    android.os.Process.myUid(), getContext().getPackageName());
        }
        return mode == AppOpsManager.MODE_ALLOWED;
    }

    private boolean isFocusServiceEnabled() {
        String enabled = Settings.Secure.getString(
                getContext().getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
        return enabled != null && enabled.toLowerCase().contains(
                getContext().getPackageName().toLowerCase() + "/" + FocusAccessibilityService.class.getName().toLowerCase());
    }

    private Set<String> selectedPackages() {
        return getContext().getSharedPreferences(PREFS, android.content.Context.MODE_PRIVATE)
                .getStringSet(KEY_PACKAGES, new HashSet<>());
    }

    @PluginMethod
    public void checkStatus(PluginCall call) {
        android.content.SharedPreferences prefs = getContext().getSharedPreferences(PREFS, android.content.Context.MODE_PRIVATE);
        JSObject result = new JSObject();
        result.put("platform", "android");
        result.put("usageAccess", hasUsageAccess());
        result.put("focusAccess", isFocusServiceEnabled());
        Set<String> savedPackages = selectedPackages();
        result.put("selectedCount", savedPackages.size());
        JSArray savedArray = new JSArray();
        for (String packageName : savedPackages) savedArray.put(packageName);
        result.put("selectedPackages", savedArray);
        result.put("limitMinutes", prefs.getInt(KEY_LIMIT, 0));
        result.put("focusEnabled", prefs.getBoolean(KEY_ENABLED, false));
        call.resolve(result);
    }

    @PluginMethod
    public void requestUsageAccess(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
        startActivityForResult(call, intent, "onUsageSettingsResult");
    }

    @ActivityCallback
    private void onUsageSettingsResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        JSObject response = new JSObject();
        response.put("usageAccess", hasUsageAccess());
        call.resolve(response);
    }

    @PluginMethod
    public void requestFocusAccess(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
        startActivityForResult(call, intent, "onFocusSettingsResult");
    }

    @ActivityCallback
    private void onFocusSettingsResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        JSObject response = new JSObject();
        response.put("focusAccess", isFocusServiceEnabled());
        call.resolve(response);
    }

    @PluginMethod
    public void listApps(PluginCall call) {
        PackageManager pm = getContext().getPackageManager();
        Intent launcherIntent = new Intent(Intent.ACTION_MAIN, null);
        launcherIntent.addCategory(Intent.CATEGORY_LAUNCHER);

        List<ResolveInfo> matches;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            matches = pm.queryIntentActivities(launcherIntent, PackageManager.ResolveInfoFlags.of(0));
        } else {
            //noinspection deprecation
            matches = pm.queryIntentActivities(launcherIntent, 0);
        }

        List<JSObject> appRows = new ArrayList<>();
        String ownPackage = getContext().getPackageName();
        Set<String> seen = new HashSet<>();
        for (ResolveInfo info : matches) {
            String packageName = info.activityInfo == null ? null : info.activityInfo.packageName;
            if (packageName == null || packageName.equals(ownPackage) || !seen.add(packageName)) continue;
            CharSequence label = info.loadLabel(pm);
            JSObject row = new JSObject();
            row.put("packageName", packageName);
            row.put("label", label == null ? packageName : label.toString());
            appRows.add(row);
        }
        Collections.sort(appRows, Comparator.comparing(row -> row.optString("label", "").toLowerCase()));
        JSArray apps = new JSArray();
        for (JSObject row : appRows) apps.put(row);
        JSObject response = new JSObject();
        response.put("apps", apps);
        call.resolve(response);
    }

    @PluginMethod
    public void startLimit(PluginCall call) {
        if (!hasUsageAccess()) {
            call.reject("먼저 Android 사용정보 접근 권한을 허용해 주세요.");
            return;
        }
        if (!isFocusServiceEnabled()) {
            call.reject("Android 설정에서 OFFROOM 접근성 서비스를 켜 주세요.");
            return;
        }
        JSArray packages = call.getArray("packages");
        int minutes = call.getInt("minutes", 30);
        if (packages == null || packages.length() == 0) {
            call.reject("제한할 앱을 하나 이상 선택해 주세요.");
            return;
        }
        if (minutes < 1 || minutes > 720) {
            call.reject("하루 한도는 1~720분 사이로 설정해 주세요.");
            return;
        }
        Set<String> packageSet = new HashSet<>();
        try {
            for (int i = 0; i < packages.length(); i++) {
                String packageName = packages.getString(i);
                if (packageName != null && !packageName.trim().isEmpty()) packageSet.add(packageName);
            }
        } catch (JSONException error) {
            call.reject("앱 목록을 읽지 못했습니다.", error);
            return;
        }
        getContext().getSharedPreferences(PREFS, android.content.Context.MODE_PRIVATE)
                .edit()
                .putStringSet(KEY_PACKAGES, packageSet)
                .putInt(KEY_LIMIT, minutes)
                .putBoolean(KEY_ENABLED, true)
                .apply();
        JSObject response = new JSObject();
        response.put("selectedCount", packageSet.size());
        response.put("limitMinutes", minutes);
        response.put("enabled", true);
        call.resolve(response);
    }

    @PluginMethod
    public void stopLimit(PluginCall call) {
        getContext().getSharedPreferences(PREFS, android.content.Context.MODE_PRIVATE)
                .edit().putBoolean(KEY_ENABLED, false).apply();
        call.resolve();
    }

    @PluginMethod
    public void getUsageStats(PluginCall call) {
        if (!hasUsageAccess()) {
            call.reject("사용 시간 접근 권한이 필요합니다.");
            return;
        }
        UsageStatsManager manager = (UsageStatsManager) getContext().getSystemService(android.content.Context.USAGE_STATS_SERVICE);
        if (manager == null) {
            call.reject("사용 시간 서비스를 찾지 못했습니다.");
            return;
        }

        Calendar start = Calendar.getInstance();
        start.set(Calendar.HOUR_OF_DAY, 0);
        start.set(Calendar.MINUTE, 0);
        start.set(Calendar.SECOND, 0);
        start.set(Calendar.MILLISECOND, 0);
        long startMs = start.getTimeInMillis();
        long endMs = System.currentTimeMillis();

        List<UsageStats> rows = manager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, startMs, endMs);
        Map<String, Long> times = new HashMap<>();
        if (rows != null) {
            for (UsageStats usage : rows) {
                String packageName = usage.getPackageName();
                if (packageName == null) continue;
                long current = times.containsKey(packageName) ? times.get(packageName) : 0L;
                times.put(packageName, current + usage.getTotalTimeInForeground());
            }
        }

        PackageManager pm = getContext().getPackageManager();
        List<JSObject> appRows = new ArrayList<>();
        long totalMs = 0;
        for (Map.Entry<String, Long> entry : times.entrySet()) {
            long millis = entry.getValue() == null ? 0L : entry.getValue();
            if (millis < 60_000L) continue;
            String packageName = entry.getKey();
            String label = packageName;
            try {
                label = pm.getApplicationLabel(pm.getApplicationInfo(packageName, 0)).toString();
            } catch (PackageManager.NameNotFoundException ignored) { }
            JSObject row = new JSObject();
            row.put("packageName", packageName);
            row.put("label", label);
            row.put("minutes", Math.round(millis / 60_000.0));
            row.put("totalTimeInForeground", millis);
            appRows.add(row);
            totalMs += millis;
        }
        Collections.sort(appRows, (a, b) -> Integer.compare(b.optInt("minutes"), a.optInt("minutes")));
        JSArray apps = new JSArray();
        for (JSObject row : appRows) apps.put(row);
        JSObject response = new JSObject();
        response.put("apps", apps);
        response.put("totalMinutes", Math.round(totalMs / 60_000.0));
        call.resolve(response);
    }
}
