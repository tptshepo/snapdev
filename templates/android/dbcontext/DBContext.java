package {{package}}.sql;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

{{#properties}}
import {{package}}.sql.entities.Entity{{titlecase}};
{{/properties}}

public class DBContext extends SQLiteOpenHelper {

    public static final String DATABASE_NAME = "{{databaseName}}";
    public static final int DATABASE_VERSION = {{version}};

    private static DBContext _instance = null;
    Context context;

    {{#properties}}
    private Entity{{titlecase}} entity{{titlecase}};
    {{/properties}}

    public DBContext(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
        this.context = context;
    }

    {{#properties}}
    public Entity{{titlecase}} get{{titlecase}}Table() {
        if (entity{{titlecase}} == null) {
            entity{{titlecase}} = new Entity{{titlecase}}(getWritableDatabase(), context);
        }
        return entity{{titlecase}};
    }
    {{/properties}}

    @Override
    public void onCreate(SQLiteDatabase database) {
        {{#properties}}
        database.execSQL(Entity{{titlecase}}.CREATE_TABLE);
        {{/properties}}
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        Log.d(DBContext.class.getName(),
                "Upgrading database from version " + oldVersion + " to "
                        + newVersion + ", which will destroy all old data");

        {{#properties}}
        db.execSQL("DROP TABLE IF EXISTS " + Entity{{titlecase}}.TABLE_NAME);
        {{/properties}}

        onCreate(db);
    }

    public void clearDatabase(){
        {{#properties}}
        get{{titlecase}}Table().truncate();
        {{/properties}}
    }


}