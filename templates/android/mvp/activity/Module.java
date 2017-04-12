package {{package}}.components.{{nameToLower}};

import {{package}}.base.annotations.PerActivity;
import {{package}}.components.{{nameToLower}}.interfaces.{{name}}Presenter;
import {{package}}.components.{{nameToLower}}.interfaces.{{name}}UI;

import dagger.Module;
import dagger.Provides;

@Module
public class {{name}}Module {

    @PerActivity
    @Provides
    public {{name}}UI provide{{name}}UI({{name}}Fragment ui) {
        return ui;
    }

    @PerActivity
    @Provides
    public {{name}}Presenter provide{{name}}Presenter({{name}}PresenterImp presenter) {
        return presenter;
    }

    @PerActivity
    @Provides
    public {{name}}Bus provide{{name}}Bus() {
        return new {{name}}Bus();
    }
}
