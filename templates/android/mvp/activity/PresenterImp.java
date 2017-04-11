package {{package}}.components.select;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Parcelable;

import com.hannesdorfmann.mosby.mvp.MvpNullObjectBasePresenter;
import {{package}}.SelectActivity;
import {{package}}.auth.AuthenticationProvider;
import {{package}}.base.Const;
import {{package}}.components.select.interfaces.SelectPresenter;
import {{package}}.components.select.interfaces.SelectUI;

import org.greenrobot.eventbus.Subscribe;

import javax.inject.Inject;

public class SelectPresenterImp extends MvpNullObjectBasePresenter<SelectUI> implements SelectPresenter {

    @Inject
    SelectBus bus;
    @Inject
    Activity activity;

    private SelectUI ui;

    @Inject
    SelectPresenterImp() {
    }

    @Override
    public void attachView(SelectUI view) {
        super.attachView(view);
        ui = getView();
        bus.register(this);
    }

    @Override
    public void detachView(boolean retainInstance) {
        super.detachView(retainInstance);
        bus.unregister(this);
    }

    private void loadItems() {

    }

    @Subscribe
    public void SelectEvent(SelectBus.SelectEvent event) {
        switch (event.getType()) {
            case NONE:
                break;
        }
    }


}
