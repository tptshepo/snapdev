package {{package}}.components.{{lcase}};

import org.greenrobot.eventbus.EventBus;

public class {{name}}Bus extends EventBus {

    public void onActivityBackPressed() {
        this.post(new {{name}}Event({{name}}EventType.ACTIVITY_BACK_CLICKED));
    }

    static class {{name}}Event {
        private final {{name}}EventType type;
        private final Object value;

        public {{name}}Event({{name}}EventType type) {
            this(type, "");
        }

        public {{name}}Event({{name}}EventType type, Object value) {
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
        ACTIVITY_BACK_CLICKED
    }
}
