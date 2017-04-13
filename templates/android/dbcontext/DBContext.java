package {{package}}.sql;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

{{#properties}}
import {{package}}.sql.Entity{{ucase}};
{{/properties}}

public class DBContext extends SQLiteOpenHelper {

    public static final String DATABASE_NAME = "{{databaseName}}";
    public static final int DATABASE_VERSION = 1;

    private static DBContext _instance = null;
    Context context;

    {{#properties}}
    private Entity{{ucase}} entity{{ucase}};
    {{/properties}}

    public DBContext(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
        this.context = context;
    }

    {{#properties}}
    public Entity{{ucase}} {{table}}() {
        if (entity{{ucase}} == null) {
            entity{{ucase}} = new Entity{{ucase}}(getWritableDatabase(), context);
        }
        return entity{{ucase}};
    }
    {{/properties}}

    @Override
    public void onCreate(SQLiteDatabase database) {
        {{#properties}}
        database.execSQL(Entity{{ucase}}.CREATE_TABLE);
        {{/properties}}
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        Log.d(DBContext.class.getName(),
                "Upgrading database from version " + oldVersion + " to "
                        + newVersion + ", which will destroy all old data");

        {{#properties}}
        db.execSQL("DROP TABLE IF EXISTS " + Entity{{ucase}}.TABLE_NAME);
        {{/properties}}

        onCreate(db);
    }

    public void clearDatabase(){
        {{#properties}}
        {{table}}().truncate();
        {{/properties}}
    }


}