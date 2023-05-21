const express = require('express');
const mysql = require('mysql');
const random_name = require('node-random-name');
const uuid = require('uuid');

const app = express();
const port = 3000;
const dbConfig = {
    host: 'mysql-db',
    user: 'root',
    password: 'root',
    database: 'nodeapp'
};

const connection = mysql.createConnection(dbConfig);

const createTable = async () => {
    const createPeople = `CREATE TABLE IF NOT EXISTS people (
        id varchar(36) primary key NOT NULL,
        name varchar(255) NOT NULL
    )`;

    return new Promise((resolve, reject) => {
        connection.query(createPeople, function(err, _results, _fields) {
            if (err) return reject(err);
            resolve(true);
        });
    });
}

const insertPerson = (name) => {
    const stmt = 'INSERT INTO people(id, name) VALUES(?, ?)';
    const params = [uuid.v4(), name];

    return new Promise((resolve, reject) => {
        connection.query(stmt, params, (err, _results, _fields) => {
            if (err) return reject(err);
            console.log(`Nome ${name} inserido no banco de dados.`);
            resolve(true);
        });
    });
}

const getPeople = () => {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM people", function (err, results, _fields) {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

const execute = async () => {
    const name = random_name();
    try {
        await insertPerson(name);
        const people = await getPeople();
        return people;
    } catch (err) {
        console.log(err);
        return [];
    }
}

const start = async () => {
    try {
        await createTable();
    } catch (error) {
        console.log(err);
    }
}

start();

app.get('/', async (_req, res) => {
    const result = await execute();
    let body = '<h1>Full Cycle</h1><ul>';
    result.forEach(element => {
        body += `<li>${element.name}</li>`;
    });
    body += '</ul>';
    res.send(body);
});

app.listen(port, () => {
    console.log(`Executando na porta ${port}...`);
});
