package {{package}}.sql;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;

import {{package}}.managers.DBContext;
import {{package}}.coredata.TB{{name}};

import java.util.ArrayList;

public class Entity{{name}} {

    public static final String TABLE_NAME = "{{tableName}}";
    public static final String COL_ID = "id";

    {{#properties}}
    public static final String COL_{{ucase}} = "{{prop}}";
    {{/properties}}

    public static final String CREATE_TABLE = "create table "
            + TABLE_NAME + "(" +
            COL_ID + " integer primary key autoincrement, " +
            {{#properties}}
            COL_{{ucase}} + " {{type}}, " +
            {{/properties}}
            ");";

    private SQLiteDatabase db;
    Context context;

    public Entity{{name}}(SQLiteDatabase db, Context context) {
        this.db = db;
        this.context = context;
    }

    public ArrayList<TB{{name}}> getList() {
        return getList(null, null);
    }

    public ArrayList<TB{{name}}> getList(String column, String value) {
        return getList(column, value, null);
    }

    public ArrayList<TB{{name}}> getList(String where) {
        return getList(null, null, where);
    }

    public ArrayList<TB{{name}}> getList(String column, String value, String whereClause) {

        ArrayList<TB{{name}}> list = new ArrayList<>();

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
                        COL_{{ucase}},
                        {{/properties}}
                },
                where,
                null, null, null, null);

        // column index
        int idIndex = cursor.getColumnIndex(COL_ID);

        {{#properties}}
        int {{prop}}Index = cursor.getColumnIndex(COL_{{ucase}});
        {{/properties}}

        cursor.moveToFirst();

        try {
            while (!cursor.isAfterLast()) {

                TB{{name}} tb{{name}} = new TB{{name}}();
                tb{{name}}.setId(cursor.getInt(idIndex));
                
                {{#properties}}
                tb{{name}}.set{{ucase}}(cursor.getString({{prop}}Index));
                {{/properties}}

                list.add(tb{{name}});

                cursor.moveToNext();
            }
        } finally {
            cursor.close();
        }

        return list;
    }

    public TB{{name}} getItem(String column, String value) {
        ArrayList<TB{{name}}> list = getList(column, value);
        if (list.size() > 0) {
            return list.get(0);
        }
        return new TB{{name}}();
    }

    public boolean add(TB{{name}} {{nameToLower}}) {

        ContentValues values = new ContentValues();

        {{#properties}}
        values.put(COL_{{ucase}}, {{nameToLower}}.get{{ucase}}());
        {{/properties}}

        long ret = db.insert(TABLE_NAME, null, values);

        return ret != -1;
    }

    public boolean update(TB{{name}} {{nameToLower}}) {

        ContentValues values = new ContentValues();

        {{#properties}}
        values.put(COL_{{ucase}}, {{nameToLower}}.get{{ucase}}());
        {{/properties}}

        long ret = db.update(TABLE_NAME,
                values,
                COL_ID + " = " + {{nameToLower}}.getId(), null);

        return ret > 0;
    }

    public boolean addOrUpdate(TB{{name}} {{nameToLower}}) {
        boolean valid;
        TB{{name}} local = getItem(COL_{{exisitpropucase}}, "'" + {{nameToLower}}.get{{exisitpropucase}}() + "'");

        if (local.getId() > 0){
            // {{nameToLower}} found
            {{nameToLower}}.setId(local.getId());
            valid = update({{nameToLower}});
        } else {
            // {{nameToLower}} not found
            valid = add({{nameToLower}});
        }
        return valid;
    }

    public boolean delete(TB{{name}} {{nameToLower}}) {
        long ret = db.delete(TABLE_NAME,
                COL_ID + " = " + {{nameToLower}}.getId(), null);
        return ret > 0;
    }

    public boolean truncate() {
        long ret = db.delete(TABLE_NAME, "1", null);
        return ret > 0;
    }

}