const sql = require('mssql')
const config = require('../configs/database')

class Database {
    config = config;
    poolconnection = null;
    connected = false;

    async connect() {
        try{
            console.log(`Database connecting...${this.connected}`);
            if (this.connected === false) {
                this.poolconnection = await sql.connect(this.config)
                this.connected = true;
                console.log('Database connection succesfull');
            } else {
                console.log('Database already connected');
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

