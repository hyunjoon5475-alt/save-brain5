package com.savebrain.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SaveBrainScreenTimePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
