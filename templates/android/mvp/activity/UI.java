package {{package}}.components.{{nameToLower}}.interfaces;

import android.content.Context;
import android.support.v7.widget.Toolbar;

import com.hannesdorfmann.mosby.mvp.MvpView;

import java.util.List;

public interface {{name}}UI extends MvpView {
    Toolbar getToolbar();
    Context getActivity();
}
