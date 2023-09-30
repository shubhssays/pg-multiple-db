const fs = require("fs");
const path = require("path");
const fileToRead = "pg-multiple-db.json";
const keyToCheck = "unique_identity";
const currentFolderPath = process.cwd();

//check for integrity of pg-multiple-db json file
function exec() {
    if (!isLibraryInstalled("dotenv")) {
        console.error('You need to install "dotenv" to proceed');
        process.exit(0);
    }

    if (!isLibraryInstalled("node-pg-migrate")) {
        console.error('You need to install "node-pg-migrate" to proceed');
        process.exit(0);
    }

    const fileToReadPath = path.join(currentFolderPath, fileToRead);
    const arr = require(fileToReadPath);

    if (!arr || arr.length < 1) {
        console.error(`Invalid structure of ${fileToRead}`)
        process.exit(0);
    }

    if (!validate(arr)) {
        console.error(`Invalid structure of ${fileToRead}`)
        process.exit(0);
    }

    let index = 0;
    let totalConfig = arr.length;
    let totalSkipped = 0;
    for (let a of arr) {
        const keys = Object.keys(a) || [];
        if (keys.length < 1) {
            console.error(`No keys found in ${index + 1} element of ${fileToRead}`);
            process.exit(0);
        }

        if (!keys.includes("unique_identity")) {
            console.error(`"unique_identity" key not found in ${index + 1} element of ${fileToRead}`);
            process.exit(0);
        }

        if (!keys.includes("env_db_username")) {
            console.error(`"env_db_username" key not found in ${index + 1} element of ${fileToRead}`);
            process.exit(0);
        }

        if (!keys.includes("env_db_host")) {
            console.error(`"env_db_host" key not found in ${index + 1} element of ${fileToRead}`);
            process.exit(0);
        }

        if (!keys.includes("env_db_name")) {
            console.error(`"env_db_name" key not found in ${index + 1} element of ${fileToRead}`);
            process.exit(0);
        }

        if (!keys.includes("env_db_port")) {
            console.error(`"env_db_port" key not found in ${index + 1} element of ${fileToRead}`);
            process.exit(0);
        }

        if (!keys.includes("env_db_password")) {
            console.error(`"env_db_password" key not found in ${index + 1} element of ${fileToRead}`);
            process.exit(0);
        }

        const unique_identity = a['unique_identity'];
        const env_db_username = a['env_db_username'];
        const env_db_host = a['env_db_host'];
        const env_db_name = a['env_db_name'];
        const env_db_port = a['env_db_port'];
        const env_db_password = a['env_db_password'];

        if (fs.existsSync(path.join(currentFolderPath, unique_identity))) {
            totalSkipped = totalSkipped + 1;
            continue;
        }

        //create a folder with name in root with "unique_identity"
        fs.mkdirSync(path.join(currentFolderPath, unique_identity));

        //inside "unique_identity" folder, create a file called "package.json" file and append below structure

        const pkJsonReplacement = `{
            "scripts": {
                "migrate": "node-pg-migrate",
                "${unique_identity}-migrate-create": "node migrationRunner.js create",
                "${unique_identity}-migrate-up": "node migrationRunner.js up",
                "${unique_identity}-migrate-down": "node migrationRunner.js down"
            }
        }`

        fs.writeFile(path.join(currentFolderPath, unique_identity, "package.json"), pkJsonReplacement, (err) => {
            if (err) {
                console.error(`Error overwriting ${path.join(currentFolderPath, unique_identity, "package.json")} file: ${err}`);
                process.exit(0);
            }
        });

        //inside "unique_identity" folder, create a file called "migrationRunner.js" file and append below structure

        const migrationRunnerReplacementMg = `
            require("dotenv").config();
            const { exec } = require('child_process');
            
            const databaseUsername = process.env.${env_db_username};
            const databaseHost = process.env.${env_db_host};
            const databaseName = process.env.${env_db_name};
            const databasePort = process.env.${env_db_port};
            const databasePassword = process.env.${env_db_password};
            
            if (!databaseUsername){
                console.error(\`${"${databaseUsername}"} not found in env file\`)
                process.exit(0);
            }
            
            if (!databaseHost) {
                console.error(\`${"${databaseHost}"} not found in env file\`)
                process.exit(0);
            }
            
            if (!databaseName) {
                console.error(\`${"${databaseName}"} not found in env file\`)
                process.exit(0);
            }
            
            if (!databasePort) {
                console.error(\`${"${databasePort}"} not found in env file\`)
                process.exit(0);
            }
            
            if (!databasePassword) {
                console.error(\`${"${databasePassword}"} not found in env file\`)
                process.exit(0);
            }
            
            function up() {
                let commandSignature = \`DATABASE_URL=postgres://${"${databaseUsername}"}:${"${databasePassword}"}@${"${databaseHost}"}:${"${databasePort}"}/${"${databaseName}"}\`;
                commandSignature = \`${"${commandSignature.replace(/ /g,'')}"}\`
                const command = \`set ${"${commandSignature}"}&&npm run migrate up\`;
                exec(command, (error, stdout, stderr) => {
                    if (stderr) {
                        console.error(stderr);
                        process.exit(0);
                    }
                    if (error) {
                        console.error(error);
                        process.exit(0);
                    }
                    console.log(stdout);
                });
            }
            
            function down() {
                let commandSignature = \`DATABASE_URL=postgres://${"${databaseUsername}"}:${"${databasePassword}"}@${"${databaseHost}"}:${"${databasePort}"}/${"${databaseName}"}\`;
                commandSignature = \`${"${commandSignature.replace(/ /g,'')}"}\`
                const command = \`set ${"${commandSignature}"}&&npm run migrate down\`;
                exec(command, (error, stdout, stderr) => {
                    if (stderr) {
                        console.error(stderr);
                        process.exit(0);
                    }
                    if (error) {
                        console.error("Error running runMe.js: ", error);
                        process.exit(0);
                    }
                    console.log(stdout);
                });
            }
            
            function create(migration_name) {
                exec(\`npm run migrate create ${"${migration_name}"}\`, (error, stdout, stderr) => {
                    if (stderr) {
                        console.error(stderr);
                        process.exit(0);
                    }
                    if (error) {
                        console.error(\`Error running runMe.js: ${"${error}"}\`);
                        process.exit(0);
                    }
                    console.log(stdout);
                });
            }
            
            if (process.argv[2] == 'up') {
                up();
            } else if (process.argv[2] == 'down') {
                down();
            } else if (process.argv[2] == 'create') {
                let migration_name = '';
                for (let i = 3; i < process.argv.length; i++) {
                    migration_name += process.argv[i] + "-"
                }
                migration_name = migration_name.substring(0, migration_name.length - 1);
                if (!migration_name) {
                    console.error('migration_name is missing');
                    console.error('Usage: npm run ${unique_identity}-migrate-create [migration_name]')
                    process.exit(0);
                }
                create(migration_name);
            } else {
                console.log('Usage: node runMigration.js [up|down|create]');
            }
        `
        fs.appendFileSync(path.join(currentFolderPath, unique_identity, "migrationRunner.js"), migrationRunnerReplacementMg);

        fs.writeFile(path.join(currentFolderPath, unique_identity, "migrationRunner.js"), migrationRunnerReplacementMg, (err) => {
            if (err) {
                console.error(`Error overwriting ${path.join(currentFolderPath, unique_identity, "migrationRunner.js")} file: ${err}`);
                process.exit(0);
            }
        });

        const valueIntermediate = `db_migrate_${unique_identity}`
        const keyCreate = `migrate:${unique_identity}:create`
        const keyCreateValue = `node ${valueIntermediate} create`
        const keyUp = `migrate:${unique_identity}:up`
        const keyUpValue = `node ${valueIntermediate} up`
        const keyDown = `migrate:${unique_identity}:down`
        const keyDownValue = `node ${valueIntermediate} down`
        const rootPjFPath = path.join(currentFolderPath, "package.json")
        const packageJsonFileRoot = require(rootPjFPath);
        const scripts = packageJsonFileRoot.scripts || {};

        scripts[keyCreate] = keyCreateValue;
        scripts[keyUp] = keyUpValue;
        scripts[keyDown] = keyDownValue;

        // console.log("scripts after *** ", scripts);
        packageJsonFileRoot.scripts = scripts;

        fs.writeFile(rootPjFPath, JSON.stringify(packageJsonFileRoot, null, 2), (err) => {
            if (err) {
                console.error(`Error writing ${rootPjFPath} file: ${err}`);
                process.exit(0);
            }
        });

        const rootRunnerReplacement = `
            require("dotenv").config();
            const { exec } = require('child_process');
            
            function up() {
                exec('npm --prefix ${unique_identity} run ${unique_identity}-migrate-up', (error, stdout, stderr) => {
                    if (stderr) {
                        console.error(stderr);
                        process.exit(0);
                    }
                    if (error) {
                        console.error(error);
                        process.exit(0);
                    }
                    console.log(stdout);
                });
            }
            
            function down() {
                exec('npm --prefix ${unique_identity} run ${unique_identity}-migrate-down', (error, stdout, stderr) => {
                    if (stderr) {
                        console.error(stderr);
                        process.exit(0);
                    }
                    if (error) {
                        console.error(error);
                        process.exit(0);
                    }
                    console.log(stdout);
                });
            }
            
            function create(migration_file_name) {
                exec(\`npm --prefix ${unique_identity} run ${unique_identity}-migrate-create ${"${migration_file_name}"}\`, (error, stdout, stderr) => {
                    if (stderr) {
                        console.error(stderr);
                        process.exit(0);
                    }
                    if (error) {
                        console.error(error);
                        process.exit(0);
                    }
                    console.log(stdout);
                });
            }
            
            const action = process.argv[2];
            if (!action) {
                console.error('action not found. Something is wrong');
                process.exit(0);
            }
            
            if (action == 'up') {
                up();
            } else if (action == 'down') {
                down();
            } else if (action == 'create') {
                let migration_file_name = '';
                for (let i = 3; i < process.argv.length; i++) {
                    migration_file_name += process.argv[i] + " "
                }
                migration_file_name = migration_file_name.substring(0, migration_file_name.length - 1);
                if (!migration_file_name) {
                    console.error('migration_file_name is missing');
                    console.error('Usage: npm run migrate:${unique_identity}:create [migration_file_name]')
                    process.exit(0);
                }
                create(migration_file_name);
            } else {
                console.error('Invalid action not found. Something is wrong');
                process.exit(0);
            }
        `
        fs.writeFile(path.join(currentFolderPath, `${valueIntermediate}.js`), rootRunnerReplacement, (err) => {
            if (err) {
                console.error(`Error writing ${rootPjFPath} file: ${err}`);
                process.exit(0);
            }
        });

    }
    const totalExecuted = totalConfig - totalSkipped;
    if (totalExecuted == 0) {
        console.log("No new configuration is pending to run");
    } else {
        console.log(`${totalExecuted} Migrations configuration completed successfully`);
    }
}

function validate(arr) {
    const existingIdentity = [];
    let index = 0;
    const keys = Object.keys(arr[0]);
    for (let a of arr) {
        if (!a?.hasOwnProperty(keyToCheck)) {
            console.error(`Each item of inside ${fileToRead} file must contain ${fileToRead}. ${index + 1} element does not contain it`)
            process.exit(0);
        }
        const value = a[keyToCheck];
        if (!value || value == null || value.trim().length < 1) {
            console.error(`Invalid value of ${keyToCheck} at ${index + 1} item of ${fileToRead} file or has an empty value`)
            process.exit(0);
        }
        if (existingIdentity.includes(value)) {
            console.error(`${fileToRead} contains duplicate values of ${keyToCheck}`);
            process.exit(0);
        }
        existingIdentity.push(value);

        for (let key of keys) {
            const value = a[key];
            if (!value || value == null || value.trim().length < 1) {
                console.error(`Invalid or empty value found for ${key} of ${index + 1} element`);
                process.exit(0);
            }
        }

        index++;
    }
    return true;
}

function isLibraryInstalled(libraryName) {
    try {
        require.resolve(libraryName);
        return true;
    } catch (err) {
        return false;
    }
}

function init(force = false) {
    
    if(!isLibraryInstalled("dotenv")){
       console.error('You need to install "dotenv" to proceed');
       process.exit(0);
    }

    if (!isLibraryInstalled("node-pg-migrate")) {
        console.error('You need to install "node-pg-migrate" to proceed');
        process.exit(0);
    }

    const filePath = path.join(currentFolderPath, fileToRead);

    if (!fs.existsSync(path.join(currentFolderPath, "package.json"))) {
        console.error(`You need initialize the npm first i.e. 'npm init' in your ${currentFolderPath} directory first`);
        process.exit(0);
    }

    fs.stat(filePath, (err, stats) => {
        if (err) {
            if (err.code === 'ENOENT') {
                rewriteConfigurationFile(filePath);
            } else {
                console.error(`Error checking file existence: ${err}`);
                process.exit(0);
            }
        } else {
            if (force) {
                rewriteConfigurationFile(filePath, true);
            } else {
                console.log(`File '${fileToRead}' exists. Pass 'true' in parameter of init function`);
            }
        }
    });
}

function rewriteConfigurationFile(filePath, force = false) {
    const structure = [{
        unique_identity: "",
        env_db_username: "",
        env_db_host: "",
        env_db_name: "",
        env_db_port: "",
        env_db_password: "",
    }];
    fs.writeFile(filePath, JSON.stringify(structure, null, 2), (err) => {
        if (err) {
            console.error(`Error overwriting file: ${err}`);
            process.exit(0);
        } else {
            force ? console.log(`File '${fileToRead}' has been successfully overwritten.`) : console.log(`File '${fileToRead}' has been created successfully.`);
        }
    });
}

module.exports = {
    init,
    exec
}