const { Router } = require('express');
const Todo = require('../models/todos');
const router = Router();

router.get('/', async (req, res) => {
    res.render('index', {
        title: 'Todos list',
        isIndex: true,
    });
});

router.get('/create', (req, res) => {
    res.render('create', {
        title: 'Create todo',
        isCreate: true,
    });
});

router.post('/create', async (req, res) => {
    const todo = new Todo(req.body.title).compileScss();
    console.log(todo)
    res.render('create', {
        title: todo.css,
        isCreate: true,
    })
});

router.post('/complete', async (req, res) => {
    res.redirect('/');
});

module.exports = router;