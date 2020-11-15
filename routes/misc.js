const { Router } = require('express');
const ScssScript = require('../models/sass-script');
const router = Router();
const { Client } = require('pg');

router.get('/', async (req, res) => {
    res.render('index', {
        title: 'Мой говносервер',
        isIndex: true,
    });
});

router.get('/products', async (req, res) => {
    const products = await new Promise((resolve, reject) => {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        });

        client.connect();

        client.query('SELECT * FROM products;', (error, response) => {
            try {
                let result = response.rows.map((row) => {
                    console.log(row);
                    return {
                        id: row.product_no,
                        name: row.name,
                        price: row.price,
                    };
                });

                client.end();

                resolve(result);
            } catch {
                console.log(error);
            }
        });
    });

    res.render('products', {
        title: 'Результаты запроса',
        isProducts: true,
        results: products,
    });
});

router.post('/db_query/products/remove', async (req, res) => {
   await new Promise((resolve) => {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        });

        client.connect();

        client.query(`DELETE FROM products WHERE product_no = ${req.body.id};`, (error, response) => {
            try {
                client.end();

                console.log(`Операция завершена, результат: ${response}`);

                resolve(response);
            } catch {
                console.log(error);
            }
        });
    });

   res.redirect('/products');
});

router.get('/create', (req, res) => {
    res.render('create', {
        title: 'Скомпилировать SCSS',
        isCreate: true,
    });
});

router.post('/compile_scss', async (req, res) => {
    console.log(`Получена строка для компиляции: ${req.body}`);

    try {
        let compiledScss = await new Promise((resolve, reject) => {
            const result = new ScssScript(req.body).compileString();

            if (result) {
                resolve(result);
            } else {
                reject(new Error('Произошла серверная ошибка компиляции'));
            }
        });

        console.log('Процесс компиляции завершен');
        res.send(compiledScss);
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});

router.post('/complete', async (req, res) => {
    res.redirect('/');
});

module.exports = router;