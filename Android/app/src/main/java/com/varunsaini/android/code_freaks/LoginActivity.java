package com.varunsaini.android.code_freaks;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;

public class LoginActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
    }

    public void openSignUpPage(View view) {
        Intent signUpIntent = new Intent(this,MainActivity.class);
        startActivity(signUpIntent);
    }

    public void openInfoActivity(View view) {
        Intent infoIntent = new Intent(this,InfoActivity.class);
        startActivity(infoIntent);
    }
}
