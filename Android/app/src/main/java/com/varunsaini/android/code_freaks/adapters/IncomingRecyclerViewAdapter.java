package com.varunsaini.android.code_freaks.adapters;

import android.content.Context;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import com.varunsaini.android.code_freaks.R;
import com.varunsaini.android.code_freaks.models.IncomingRequest;

import java.util.List;

public class IncomingRecyclerViewAdapter extends RecyclerView.Adapter<IncomingRecyclerViewAdapter.IncomingViewHolder>{

    private Context mCtx;
    List<IncomingRequest> incomingRequestList ;

    public IncomingRecyclerViewAdapter(List<IncomingRequest> incomingRequestList) {
        this.incomingRequestList = incomingRequestList;
    }

    @Override
    public IncomingViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.incoming_card_layout, parent, false);
        IncomingViewHolder ivh = new IncomingViewHolder(v);
        return ivh;
    }

    @Override
    public void onBindViewHolder(IncomingViewHolder holder, int position) {
        IncomingRequest model = incomingRequestList.get(position);
        holder.username.setText(model.getUsername());
        holder.preference.setText(model.getPreference());
        holder.desc.setText(model.getDesc());
        holder.time.setText(model.getTime());
        holder.place.setText(model.getPlace());

    }

    @Override
    public int getItemCount() {
        return incomingRequestList.size();
    }

    class IncomingViewHolder extends RecyclerView.ViewHolder {

        TextView username, preference, desc, time, place;

        public IncomingViewHolder(View itemView) {
            super(itemView);
            username = itemView.findViewById(R.id.username);
            preference = itemView.findViewById(R.id.pref);
            desc = itemView.findViewById(R.id.desc);
            time = itemView.findViewById(R.id.time);
            place = itemView.findViewById(R.id.place);
        }
    }
}
