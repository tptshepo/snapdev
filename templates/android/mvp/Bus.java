package {{package}}.components.{{lcase}};

import {{package}}.helpers.KeyVal;
import org.greenrobot.eventbus.EventBus;

public class {{name}}Bus extends EventBus {

    void none() {
        this.post(new {{name}}Event({{name}}EventType.NONE, null));
    }

    static class {{name}}Event {
        private final {{name}}EventType type;
        private final Object value;

        KeyVal<String, String> getLogin() {
            return (KeyVal) this.value;
        }

        {{name}}Event({{name}}EventType type, Object value) {
            this.type = type;
            this.value = value;
        }

        public Object getValue() {
            return this.value;
        }

        public {{name}}EventType getType() {
            return this.type;
        }
    }

    enum {{name}}EventType {
        NONE
    }
}
