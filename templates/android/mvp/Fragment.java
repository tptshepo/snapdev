package {{package}}.components.{{lcase}};


import android.app.Activity;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.v7.widget.Toolbar;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import com.hannesdorfmann.mosby.mvp.MvpFragment;
import {{package}}.R;
import {{package}}.components.{{lcase}}.interfaces.{{name}}Presenter;
import {{package}}.components.{{lcase}}.interfaces.{{name}}UI;
import javax.inject.Inject;
import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.Unbinder;

public class {{name}}Fragment extends MvpFragment<{{name}}UI, {{name}}Presenter> implements {{name}}UI {

    @Inject
    {{name}}Bus bus;
    @Inject
    {{name}}Presenter presenter;
    @Inject
    Activity activity;

    @BindView(R.id.toolbar)
    Toolbar toolbar;

    private Unbinder unbinder;

    @Inject
    public {{name}}Fragment() {
        super();
    }

    @Override
    @NonNull
    public {{name}}Presenter createPresenter() {
        return presenter;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {

        super.onCreateView(inflater, container, savedInstanceState);
        View rootView = inflater.inflate(R.layout.fragment_{{lcase}}, container, false);

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
