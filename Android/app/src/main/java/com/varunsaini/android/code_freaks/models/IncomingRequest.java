package com.varunsaini.android.code_freaks.models;

/**
 * Created by Snik on 22-03-2019.
 */

public class IncomingRequest {
    private String Username;
    private String Preference;
    private String Desc;
    private String Time;
    private String Place;

    public IncomingRequest(String username, String preference, String desc, String time, String place) {
        Username = username;
        Preference = preference;
        Desc = desc;
        Time = time;
        Place = place;
    }

    public String getUsername() {
        return Username;
    }

    public String getPreference() {
        return Preference;
    }

    public String getDesc() {
        return Desc;
    }

    public String getTime() {
        return Time;
    }

    public String getPlace() {
        return Place;
    }
}
