package {{package}}.components.select;

import {{package}}.base.annotations.PerActivity;
import {{package}}.components.select.interfaces.SelectPresenter;
import {{package}}.components.select.interfaces.SelectUI;

import dagger.Module;
import dagger.Provides;

@Module
public class SelectModule {

    @PerActivity
    @Provides
    public SelectUI provideSelectUI(SelectFragment ui) {
        return ui;
    }

    @PerActivity
    @Provides
    public SelectPresenter provideSelectPresenter(SelectPresenterImp presenter) {
        return presenter;
    }

    @PerActivity
    @Provides
    public SelectBus provideSelectBus() {
        return new SelectBus();
    }
}
