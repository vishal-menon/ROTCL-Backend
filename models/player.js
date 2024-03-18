const sql = require('mssql')

class Database {
    config = {};
    poolconnection = null;
    connected = false;

    constructor(config) {
        this.config = config;
    }

    async connect() {
        try{
            console.log(`Database connecting...${this.connected}`);
            if (this.connected === false) {
                this.poolconnection = await sql.connect(this.config)
                this.connected = true;
                console.log('Database connection succesful');
            } else {
                console.log('Database already connected');
            }
        } catch (error) {
            console.error(`Error connecting to database : ${error}`);
        }
    }

    async disconnect() {
        try {
            this.poolconnection.close();
            console.log('Database connection closed');
        } catch (error) {
            console.error(`Error closing the database connection ${error}`);
        }
    }

    async create(data) {
        await this.connect();
        const request = this.poolconnection.request();
        
        request.input('uid', sql.NVarChar(255), data.uid)
        request.input('pwdHash', sql.NVarChar(255), data.pwdHash)
        request.input('email', sql.NVarChar(255), data.email)
        request.input('exp', sql.Int(), data.exp)

        const result = await request.query(
            `INSERT INTO Players (uid, pwdHash, email, exp) VALUES (@uid, @pwdHash, @email, @exp)`
        );

        return result.rowsAffected[0];
    }

    async readAll() {
        await this.connect();
        const request = this.poolconnection.request();

        const result = await request.query(
            'SELECT * FROM PLAYERS '
        );

        return result.recordsets[0];
    }

    async read(id) {
        await this.connect()
        const request = this.poolconnection.request()

        const result = await request
            .input('uid', sql.NVarChar(255), id)    
            .query(`SELECT * FROM Players where uid = @uid`)
        
        return result.recordsets[0];
    }

    async update(id, data) {
        await this.connect();
        const request = this.poolconnection.request();
        
        request.input('uid', sql.NVarChar(255), id);
        request.input('pwdHash', sql.NVarChar(255), data.pwdHash);
        request.input('email', sql.NVarChar(255), data.email);
        request.input('exp', sql.Int(), data.exp);

        const result = await request.query(
            `UPDATE Players SET pwdHash=@pwdHash, email=@email, exp=@exp WHERE uid=@uid`
        );

        return result.rowsAffected[0];
    }

    async delete(id) {
        await this.connect();
        const request = this.poolconnection.request();

        const result = await request
            .input('id', NVarChar(255), id)
            .query(`DELETE FROM Players WHERE uid=@uid`);
        
            return result.rowsAffected[0];
    }

    async createTable() {
        await this.connect();
        const request = this.poolconnection.request();

        const result = await request.query(
            'CREATE TABLE PLAYERS (uid varchar(255) PRIMARY KEY, pwdHash varchar(255), email varchar(255), exp int)'
        )
    }
}

module.exports = Database