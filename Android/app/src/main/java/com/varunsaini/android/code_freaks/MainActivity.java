package com.varunsaini.android.code_freaks;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }

    public void openLoginPage(View view) {

        Intent loginIntent = new Intent(this,LoginActivity.class);
        startActivity(loginIntent);

    }
}
