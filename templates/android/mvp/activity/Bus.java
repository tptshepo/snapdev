package {{package}}.components.select;

import {{package}}.helpers.KeyVal;
import org.greenrobot.eventbus.EventBus;

public class SelectBus extends EventBus {

    void none() {
        this.post(new SelectEvent(SelectEventType.NONE, null));
    }

    static class SelectEvent {
        private final SelectEventType type;
        private final Object value;

        KeyVal<String, String> getLogin() {
            return (KeyVal) this.value;
        }

        SelectEvent(SelectEventType type, Object value) {
            this.type = type;
            this.value = value;
        }

        public Object getValue() {
            return this.value;
        }

        public SelectEventType getType() {
            return this.type;
        }
    }

    enum SelectEventType {
        NONE
    }
}
