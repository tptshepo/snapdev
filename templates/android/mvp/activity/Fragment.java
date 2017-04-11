package {{package}}.components.select;


import android.app.Activity;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.v7.widget.Toolbar;
import android.view.LayoutInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ListView;

import com.hannesdorfmann.mosby.mvp.MvpFragment;
import {{package}}.R;
import {{package}}.base.Const;
import {{package}}.components.select.interfaces.SelectPresenter;
import {{package}}.components.select.interfaces.SelectUI;

import java.util.ArrayList;
import java.util.List;

import javax.inject.Inject;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.Unbinder;

public class SelectFragment extends MvpFragment<SelectUI, SelectPresenter> implements SelectUI {

    @Inject
    SelectBus bus;
    @Inject
    SelectPresenter presenter;
    @Inject
    Activity activity;

    @BindView(R.id.toolbar)
    Toolbar toolbar;

    private Unbinder unbinder;

    @Inject
    public SelectFragment() {
        super();
    }

    @Override
    @NonNull
    public SelectPresenter createPresenter() {
        return presenter;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {

        super.onCreateView(inflater, container, savedInstanceState);
        View rootView = inflater.inflate(R.layout.fragment_select, container, false);

        unbinder = ButterKnife.bind(this, rootView);

       

        return rootView;
    }

    @Override
    public Toolbar getToolbar() {
        return toolbar;
    }

    @Override
    public void onResume() {
        super.onResume();
    }

    @Override
    public void onPause() {
        super.onPause();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        unbinder.unbind();
        bus.unregister(this);
    }



}
