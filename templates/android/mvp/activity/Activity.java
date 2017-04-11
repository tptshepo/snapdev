package {{package}};

import android.content.Context;
import android.support.v4.app.Fragment;
import android.support.v7.app.ActionBar;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.MenuItem;

import {{package}}.components.ActivityModule;
import {{package}}.components.select.interfaces.DaggerSelectComponent;
import {{package}}.components.select.interfaces.SelectComponent;
import {{package}}.components.select.interfaces.SelectPresenter;
import {{package}}.components.select.interfaces.SelectUI;

import javax.inject.Inject;

public class SelectActivity extends SingleFragmentActivity {

    @Inject
    SelectUI ui;
    @Inject
    SelectPresenter presenter;

    private ActionBar actionBar;

    @Override
    protected void initializeInjector() {
        SelectComponent component = DaggerSelectComponent
                .builder()
                .activityModule(new ActivityModule(this))
                .applicationComponent(getApplicationComponent())
                .build();

        component.inject(this);
    }

    @Override
    protected Fragment getFragment(Context context) {
        return (Fragment) this.ui;
    }

    @Override
    protected void onStart() {
        super.onStart();

        setSupportActionBar(ui.getToolbar());

        actionBar = getSupportActionBar();
        actionBar.setHomeAsUpIndicator(R.drawable.ic_arrow_back_white);
        actionBar.setDisplayHomeAsUpEnabled(true);
    }

    @Override
    protected void onStop() {
        super.onStop();

        actionBar = null;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem menuItem) {
        if (menuItem.getItemId() == android.R.id.home) {
            finish();
        }
        return super.onOptionsItemSelected(menuItem);
    }
}

