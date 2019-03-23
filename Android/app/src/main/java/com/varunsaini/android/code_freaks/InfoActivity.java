package com.varunsaini.android.code_freaks;

import android.app.TimePickerDialog;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.util.Log;
import android.view.View;
import android.widget.TextView;
import android.widget.TimePicker;
import android.widget.Toast;

import com.google.android.gms.common.api.Status;
import com.google.android.libraries.places.api.Places;
import com.google.android.libraries.places.api.model.Place;
import com.google.android.libraries.places.widget.AutocompleteSupportFragment;
import com.google.android.libraries.places.widget.listener.PlaceSelectionListener;
import com.jaredrummler.materialspinner.MaterialSpinner;
import com.varunsaini.android.code_freaks.adapters.IncomingRecyclerViewAdapter;
import com.varunsaini.android.code_freaks.adapters.InviteRecyclerViewAdapter;
import com.varunsaini.android.code_freaks.models.IncomingRequest;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;

public class InfoActivity extends AppCompatActivity {

    TextView time;
    int mHour,mMinute;
    RecyclerView incomingRecyclerView;
    RecyclerView inviteRecyclerView;
    ArrayList<IncomingRequest> incomingRequestArrayList;
    ArrayList<IncomingRequest> inviteRequestArrayList;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_info);
        selectMeetUpTopic();
        initViews();
        setPlaceSelection();
        incomingRequestArrayList = new ArrayList<IncomingRequest>();
        inviteRequestArrayList = new ArrayList<IncomingRequest>();
        addDemoData();
        addInviteDemoData();
        setPendingRecyclerView();
    }

    private void addInviteDemoData() {
        inviteRequestArrayList.add(new IncomingRequest("Varun","Other Talk","saaaaaaaaaaaaaaaaaaaaaaafdsdgfdghbgfdzfbsVAfgbdsfgfdsfghgytredsfghtredsfgh","12:30","Rock Garden"));
        inviteRequestArrayList.add(new IncomingRequest("Varun","Other Talk","saaaaaaaaaaaaaaaaaaaaaaafdsdgfdghbgfdzfbsVAfgbdsfgfdsfghgytredsfghtredsfgh","12:30","Rock Garden"));

    }

    private void addDemoData() {
        incomingRequestArrayList.add(new IncomingRequest("Varun","Other Talk","saaaaaaaaaaaaaaaaaaaaaaafdsdgfdghbgfdzfbsVAfgbdsfgfdsfghgytredsfghtredsfgh","12:30","Rock Garden"));
        incomingRequestArrayList.add(new IncomingRequest("Varun","Other Talk","saaaaaaaaaaaaaaaaaaaaaaafdsdgfdghbgfdzfbsVAfgbdsfgfdsfghgytredsfghtredsfgh","12:30","Rock Garden"));
//        incomingRequestArrayList.add(new IncomingRequest("Varun","Other Talk","saaaaaaaaaaaaaaaaaaaaaaafdsdgfdghbgfdzfbsVAfgbdsfgfdsfghgytredsfghtredsfgh","12:30","Rock Garden"));
//        incomingRequestArrayList.add(new IncomingRequest("Varun","Other Talk","saaaaaaaaaaaaaaaaaaaaaaafdsdgfdghbgfdzfbsVAfgbdsfgfdsfghgytredsfghtredsfgh","12:30","Rock Garden"));
//        incomingRequestArrayList.add(new IncomingRequest("Varun","Other Talk","saaaaaaaaaaaaaaaaaaaaaaafdsdgfdghbgfdzfbsVAfgbdsfgfdsfghgytredsfghtredsfgh","12:30","Rock Garden"));
//        incomingRequestArrayList.add(new IncomingRequest("Varun","Other Talk","saaaaaaaaaaaaaaaaaaaaaaafdsdgfdghbgfdzfbsVAfgbdsfgfdsfghgytredsfghtredsfgh","12:30","Rock Garden"));
//        incomingRequestArrayList.add(new IncomingRequest("Varun","Other Talk","saaaaaaaaaaaaaaaaaaaaaaafdsdgfdghbgfdzfbsVAfgbdsfgfdsfghgytredsfghtredsfgh","12:30","Rock Garden"));


    }

    private void setPendingRecyclerView() {

        incomingRecyclerView.setHasFixedSize(true);
        incomingRecyclerView.setNestedScrollingEnabled(false);
        incomingRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        incomingRecyclerView.setAdapter(new IncomingRecyclerViewAdapter(incomingRequestArrayList));

        inviteRecyclerView.setNestedScrollingEnabled(false);
        inviteRecyclerView.setHasFixedSize(true);
        inviteRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        inviteRecyclerView.setAdapter(new InviteRecyclerViewAdapter(inviteRequestArrayList));


    }

    private void initViews() {
        time = findViewById(R.id.time);
        incomingRecyclerView = findViewById(R.id.pending_recycler_view);
        inviteRecyclerView = findViewById(R.id.invite_recycler_view);
    }

    private void selectMeetUpTopic() {

        MaterialSpinner spinner = (MaterialSpinner) findViewById(R.id.spinner);
        String[] preferncesArray = {"Yoga", "Religious Talks", "Movies and Movies", "Current Affairs", "General Group"};
        spinner.setItems(preferncesArray);
        spinner.setOnItemSelectedListener(new MaterialSpinner.OnItemSelectedListener<String>() {

            @Override
            public void onItemSelected(MaterialSpinner view, int position, long id, String item) {
                Toast.makeText(InfoActivity.this, item, Toast.LENGTH_SHORT).show();
            }
        });

    }

    public void pickTimeForMeetUp(View view) {
        // TODO Auto-generated method stub
        final Calendar c = Calendar.getInstance();
        mHour = c.get(Calendar.HOUR_OF_DAY);
        mMinute = c.get(Calendar.MINUTE);

        // Launch Time Picker Dialog
        TimePickerDialog timePickerDialog = new TimePickerDialog(this,
                new TimePickerDialog.OnTimeSetListener() {

                    @Override
                    public void onTimeSet(TimePicker view, int hourOfDay,
                                          int minute) {

                        time.setText(hourOfDay + ":" + minute);
                    }
                }, mHour, mMinute, false);
        timePickerDialog.show();
    }

    void setPlaceSelection() {

        if (!Places.isInitialized()) {
            Places.initialize(getApplicationContext(), (Constants.API_KEY_PLACE_SATIN));
        }
        AutocompleteSupportFragment autocompleteFragment = (AutocompleteSupportFragment)
                getSupportFragmentManager().findFragmentById(R.id.autocomplete_fragment);
        autocompleteFragment.setPlaceFields(Arrays.asList(Place.Field.ID, Place.Field.NAME));
        autocompleteFragment.setOnPlaceSelectedListener(new PlaceSelectionListener() {
            @Override
            public void onPlaceSelected(Place place) {

            }

            @Override
            public void onError(Status status) {
                Log.i("Error", "An error occurred: " + status);
            }
        });
    }

}
