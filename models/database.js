const sql = require('mssql')
const config = require('../configs/database')

class Database {
    config = config;
    poolconnection = null;
    connected = false;
    
    async connect() {
        try{
            if (this.connected === false) {
                this.poolconnection = await sql.connect(this.config)
                this.connected = true;
                console.log('DB Connection successfull');
            } 
        } catch (error) {
            console.error(`Error connecting to database : ${error}`);
        }

        return this.poolconnection.request();
    }

    async disconnect() {
        try {
            this.poolconnection.close();
            console.log('Database connection closed');
        } catch (error) {
            console.error(`Error closing the database connection ${error}`);
        }
    }
}

module.exports = Database

