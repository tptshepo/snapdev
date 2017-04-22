package {{package}}.sql.entities;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import {{package}}.sql.tables.TB{{class}};

import java.util.ArrayList;

public class Entity{{class}} {

    public static final String TABLE_NAME = "tbl{{class}}";
    public static final String COL_ID = "id";

    {{#properties}}
    public static final String COL_{{titlecase}} = "{{name}}";
    {{/properties}}

    public static final String CREATE_TABLE = "create table "
            + TABLE_NAME + "(" +
            COL_ID + " integer primary key autoincrement, " +
            {{#properties}}
            COL_{{titlecase}} + " {{sqltype}}{{^last}},{{/last}} " +
            {{/properties}}
            ");";

    private SQLiteDatabase db;
    Context context;

    public Entity{{class}}(SQLiteDatabase db, Context context) {
        this.db = db;
        this.context = context;
    }

    public ArrayList<TB{{class}}> getList() {
        return getList(null, null);
    }

    public ArrayList<TB{{class}}> getList(String column, String value) {
        return getList(column, value, null);
    }

    public ArrayList<TB{{class}}> getList(String where) {
        return getList(null, null, where);
    }

    public ArrayList<TB{{class}}> getList(String column, String value, String whereClause) {

        ArrayList<TB{{class}}> list = new ArrayList<>();

        String where = null;

        if (whereClause == null) {
            if (column != null)
                where = column + " = " + value;
        } else {
            where = whereClause;
        }

        Cursor cursor = db.query(TABLE_NAME,
                new String[]{
                        COL_ID,
                        {{#properties}}
                        COL_{{titlecase}}{{^last}},{{/last}}
                        {{/properties}}
                },
                where,
                null, null, null, null);

        // column index
        int idIndex = cursor.getColumnIndex(COL_ID);

        {{#properties}}
        int {{camelcase}}Index = cursor.getColumnIndex(COL_{{titlecase}});
        {{/properties}}

        cursor.moveToFirst();

        try {
            while (!cursor.isAfterLast()) {

                TB{{class}} tb{{class}} = new TB{{class}}();
                tb{{class}}.setId(cursor.getInt(idIndex));
                
                {{#properties}}
                tb{{class}}.set{{titlecase}}(cursor.getString({{camelcase}}Index));
                {{/properties}}

                list.add(tb{{class}});

                cursor.moveToNext();
            }
        } finally {
            cursor.close();
        }

        return list;
    }

    public TB{{class}} getItem(String column, String value) {
        ArrayList<TB{{class}}> list = getList(column, value);
        if (list.size() > 0) {
            return list.get(0);
        }
        return new TB{{class}}();
    }

    public boolean add(TB{{class}} {{camelcase}}) {

        ContentValues values = new ContentValues();

        {{#properties}}
        values.put(COL_{{titlecase}}, {{rcamelcase}}.get{{titlecase}}());
        {{/properties}}

        long ret = db.insert(TABLE_NAME, null, values);

        return ret != -1;
    }

    public boolean update(TB{{class}} {{camelcase}}) {

        ContentValues values = new ContentValues();

        {{#properties}}
        values.put(COL_{{titlecase}}, {{rcamelcase}}.get{{titlecase}}());
        {{/properties}}

        long ret = db.update(TABLE_NAME,
                values,
                COL_ID + " = " + {{camelcase}}.getId(), null);

        return ret > 0;
    }

    public boolean addOrUpdate(TB{{class}} {{camelcase}}) {
        boolean valid;
        TB{{class}} local = getItem(COL_{{exisitprop}}, "'" + {{camelcase}}.get{{exisitprop}}() + "'");

        if (local.getId() > 0){
            // {{camelcase}} found
            {{camelcase}}.setId(local.getId());
            valid = update({{camelcase}});
        } else {
            // {{camelcase}} not found
            valid = add({{camelcase}});
        }
        return valid;
    }

    public boolean delete(TB{{class}} {{camelcase}}) {
        long ret = db.delete(TABLE_NAME,
                COL_ID + " = " + {{camelcase}}.getId(), null);
        return ret > 0;
    }

    public boolean truncate() {
        long ret = db.delete(TABLE_NAME, "1", null);
        return ret > 0;
    }

}