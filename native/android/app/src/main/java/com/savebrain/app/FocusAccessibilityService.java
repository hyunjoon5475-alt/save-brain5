package com.savebrain.app;

import android.accessibilityservice.AccessibilityService;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Intent;
import android.os.SystemClock;
import android.os.Handler;
import android.os.Looper;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityServiceInfo;

import java.util.Calendar;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Reads only the foreground package identifier from window-state events.
 * It does not retrieve window contents, typed text, notifications, or messages.
 */
public class FocusAccessibilityService extends AccessibilityService {
    private static final String PREFS = "save_brain_focus";
    private static final String KEY_PACKAGES = "blocked_packages";
    private static final String KEY_LIMIT = "daily_limit_minutes";
    private static final String KEY_ENABLED = "focus_enabled";
    private long lastShieldLaunch = 0L;
    private String lastForegroundPackage = null;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable usageTicker = new Runnable() {
        @Override public void run() {
            checkCurrentForegroundLimit();
            handler.postDelayed(this, 10_000L);
        }
    };

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        AccessibilityServiceInfo info = new AccessibilityServiceInfo();
        info.eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED;
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC;
        info.notificationTimeout = 150;
        info.flags = 0;
        setServiceInfo(info);
        handler.removeCallbacks(usageTicker);
        handler.postDelayed(usageTicker, 10_000L);
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null || event.getPackageName() == null) return;
        String foregroundPackage = event.getPackageName().toString();
        lastForegroundPackage = foregroundPackage;
        if (foregroundPackage.equals(getPackageName())) return;
        checkCurrentForegroundLimit();
    }

    private void checkCurrentForegroundLimit() {
        String foregroundPackage = lastForegroundPackage;
        if (foregroundPackage == null || foregroundPackage.equals(getPackageName())) return;
        android.content.SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        if (!prefs.getBoolean(KEY_ENABLED, false)) return;
        Set<String> blocked = new HashSet<>(prefs.getStringSet(KEY_PACKAGES, new HashSet<>()));
        if (!blocked.contains(foregroundPackage)) return;

        int limitMinutes = prefs.getInt(KEY_LIMIT, 30);
        long usedMs = getSelectedAppsUsageToday(blocked);
        if (usedMs < limitMinutes * 60_000L) return;

        long now = SystemClock.elapsedRealtime();
        if (now - lastShieldLaunch < 1200L) return;
        lastShieldLaunch = now;

        Intent intent = new Intent(this, FocusShieldActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        intent.putExtra("limitMinutes", limitMinutes);
        startActivity(intent);
    }

    private long getSelectedAppsUsageToday(Set<String> selectedPackages) {
        UsageStatsManager manager = (UsageStatsManager) getSystemService(USAGE_STATS_SERVICE);
        if (manager == null) return 0L;
        Calendar start = Calendar.getInstance();
        start.set(Calendar.HOUR_OF_DAY, 0);
        start.set(Calendar.MINUTE, 0);
        start.set(Calendar.SECOND, 0);
        start.set(Calendar.MILLISECOND, 0);
        List<UsageStats> stats = manager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                start.getTimeInMillis(),
                System.currentTimeMillis());
        if (stats == null) return 0L;
        long total = 0L;
        for (UsageStats usage : stats) {
            if (selectedPackages.contains(usage.getPackageName())) {
                total += usage.getTotalTimeInForeground();
            }
        }
        return total;
    }

    @Override
    public void onInterrupt() {
        handler.removeCallbacks(usageTicker);
        lastForegroundPackage = null;
    }
}
