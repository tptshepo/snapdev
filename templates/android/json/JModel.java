package {{package}}.jsonmodels;

import org.json.JSONException;
import org.json.JSONObject;

public class J{{class}} {

    {{#properties}}
    public static final String JField_{{titlecase}} = "{{name}}";
    {{/properties}}

    {{#properties}}
    private {{{type}}} {{camelcase}};
    {{/properties}}
    
    public J{{class}}(
        {{#properties}}
        {{{type}}} {{camelcase}}{{^last}},{{/last}}
        {{/properties}}
        ){

        {{#properties}}
        this.{{camelcase}} = {{camelcase}};
        {{/properties}}
        
    }

    public static J{{class}} initWithJSONObject(JSONObject json) throws JSONException {
        {{#properties}}
        {{#isArray}}
        ArrayList<String> {{camelcase}} = new ArrayList<>();
        JSONArray json{{titlecase}} = json.getJSONArray(JField_{{titlecase}});
        for (int i = 0; i < json{{titlecase}}.length(); i++) {
            {{camelcase}}.add({{type}}.initWithJSONObject(json{{titlecase}}[i]));
        }
        {{/isArray}}

        {{/properties}}

        return new J{{class}}(
                {{#properties}}
                {{#isProp}}json.getString(JField_{{titlecase}}){{^last}},{{/last}}{{/isProp}}{{#isArray}}{{camelcase}}{{^last}},{{/last}}{{/isArray}}{{#isObject}}json.getString(JField_{{titlecase}}){{^last}},{{/last}}{{/isObject}}               
                {{/properties}}
        );

    }

    public JSONObject getJSONObject() throws JSONException {

        JSONObject json = new JSONObject();

        {{#properties}}
        json.put(JField_{{titlecase}}, this.{{camelcase}});
        {{/properties}}

        return json;
    }


    {{#properties}}
    public {{#isProp}}{{{type}}}{{/isProp}}{{#isArray}}ArrayList<{{{type}}}>{{/isArray}}{{#isObject}}{{{type}}}{{/isObject}} get{{titlecase}}() {
        return {{camelcase}};
    }
    public void set{{titlecase}}({{#isProp}}{{{type}}}{{/isProp}}{{#isArray}}ArrayList<{{{type}}}>{{/isArray}}{{#isObject}}{{{type}}}{{/isObject}} {{camelcase}}) {
        this.{{camelcase}} = {{camelcase}};
    }

    {{/properties}}
}
