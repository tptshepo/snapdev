package {{package}}.components.{{nameToLower}};

import android.app.Activity;
import com.hannesdorfmann.mosby.mvp.MvpNullObjectBasePresenter;
import {{package}}.components.{{nameToLower}}.interfaces.{{name}}Presenter;
import {{package}}.components.{{nameToLower}}.interfaces.{{name}}UI;
import org.greenrobot.eventbus.Subscribe;
import javax.inject.Inject;

public class {{name}}PresenterImp extends MvpNullObjectBasePresenter<{{name}}UI> implements {{name}}Presenter {

    @Inject
    {{name}}Bus bus;
    @Inject
    Activity activity;

    private {{name}}UI ui;

    @Inject
    {{name}}PresenterImp() {
    }

    @Override
    public void attachView({{name}}UI view) {
        super.attachView(view);
        ui = getView();
        bus.register(this);
    }

    @Override
    public void detachView(boolean retainInstance) {
        super.detachView(retainInstance);
        bus.unregister(this);
    }

    @Subscribe
    public void {{name}}Event({{name}}Bus.{{name}}Event event) {
        switch (event.getType()) {
            case NONE:
                break;
        }
    }


}
