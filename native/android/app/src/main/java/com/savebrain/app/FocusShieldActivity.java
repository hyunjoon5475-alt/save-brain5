package com.savebrain.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

public class FocusShieldActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        int limitMinutes = getIntent().getIntExtra("limitMinutes", 30);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setPadding(32, 48, 32, 48);
        root.setBackgroundColor(Color.rgb(244, 237, 227));

        TextView eyebrow = new TextView(this);
        eyebrow.setText("OFFROOM · FOCUS BREAK");
        eyebrow.setTextColor(Color.rgb(137, 101, 70));
        eyebrow.setTextSize(12);
        eyebrow.setGravity(Gravity.CENTER);

        TextView title = new TextView(this);
        title.setText("오늘 정한 휴식 시간이에요.");
        title.setTextColor(Color.rgb(72, 54, 40));
        title.setTextSize(25);
        title.setGravity(Gravity.CENTER);
        title.setPadding(0, 22, 0, 12);

        TextView body = new TextView(this);
        body.setText("선택한 앱의 하루 사용 한도 " + limitMinutes + "분에 도달했습니다.\n잠깐 화면을 내려놓고, 나에게 필요한 시간을 가져보세요.\n\n집중 모드는 언제든 Android 설정에서 직접 끌 수 있습니다.");
        body.setTextColor(Color.rgb(111, 91, 72));
        body.setTextSize(15);
        body.setGravity(Gravity.CENTER);
        body.setLineSpacing(8, 1f);
        body.setPadding(0, 0, 0, 28);

        Button home = new Button(this);
        home.setText("홈 화면으로 돌아가기");
        home.setTextColor(Color.WHITE);
        home.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.rgb(121, 86, 63)));
        home.setOnClickListener(view -> {
            Intent homeIntent = new Intent(Intent.ACTION_MAIN);
            homeIntent.addCategory(Intent.CATEGORY_HOME);
            homeIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(homeIntent);
            finish();
        });

        Button settings = new Button(this);
        settings.setText("집중 모드 설정 열기");
        settings.setOnClickListener(view -> {
            startActivity(new Intent(android.provider.Settings.ACTION_ACCESSIBILITY_SETTINGS));
        });

        root.addView(eyebrow, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        root.addView(title, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        root.addView(body, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        root.addView(home, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        root.addView(settings, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        setContentView(root);
    }
}
