# pg-multiple-db-migrate

This library is specifically meant for postgresql only. It only generates the structure and code to maintain multiple databases. It's important to note that this library needs \"node-pg-migrate\" library and \"dotenv\" library to run migration.

## Installation

```sh
npm i pg-multiple-db-migrate

1. const {init, exec} = require("pg-multiple-db-migrate");

2. Run init function to intialize the library once which will create "pg-multiple-db.json" file at the root folder. This function should be executed only once. It will look like 
[
    {
        "unique_identity":"",
        "env_db_username":"",
        "env_db_host": "",
        "env_db_name": "",
        "env_db_port": "",
        "env_db_password": ""
    }
]

3. Fill the required data in "pg-multiple-db.json" file. It should be updated like this.
[
    {
        "unique_identity":"pg_test",
        "env_db_username":"PG_USERNAME",
        "env_db_host": "PG_HOST",
        "env_db_name": "PG_DB",
        "env_db_port": "PG_PORT",
        "env_db_password": "PG_PASSWORD"
    }
]

You can have any number of items in the array above. The only contraints is 
"unique_identity" should have unique values and values of other fields should be available in environment variables. 

For eg. PG_USERNAME, PG_HOST, PG_DB, PG_PORT, PG_PASSWORD should be available in .env file.

4. Once the "pg-multiple-db.json" file is updated, you can comment init() function and then run exec function.

5. Each time you modify the "pg-multiple-db.json" file. You need to run exec() function and it will handle rest.

6. exec function adds extra commands in the script tag of your root folder for "create", "up" and "down" of migration file.
```

## License

MIT

