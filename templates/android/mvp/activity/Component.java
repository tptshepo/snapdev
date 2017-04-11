package {{package}}.components.select.interfaces;

import {{package}}.ApplicationComponent;
import {{package}}.LoginActivity;
import {{package}}.SelectActivity;
import {{package}}.base.annotations.PerActivity;
import {{package}}.components.ActivityModule;
import {{package}}.components.select.SelectModule;

import dagger.Component;

@PerActivity
@Component(dependencies = {ApplicationComponent.class},
        modules = {ActivityModule.class, SelectModule.class})
public interface SelectComponent {
    void inject(SelectActivity holder);
}
