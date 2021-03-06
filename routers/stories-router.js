'use strict';

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

// var data = require('../db/dummy-data');

const { DATABASE, PORT } = require('../config');
//knex needs to know which db to talk to
const knex = require('knex')(DATABASE);

/* ========== GET/READ ALL ITEMS ========== */
router.get('/stories', (req, res) => {
  knex.select()
    .from('stories')
    .then(results => {
      res.json(results).status(200);
    });
});

/* ========== GET/READ SINGLE ITEMS ========== */
router.get('/stories/:id', (req, res) => {
  knex.first()
    .from('stories')
    .where('stories.id', req.params.id)
    .then(results => res.json(results).status(200));
});

/* ========== POST/CREATE ITEM ========== */
router.post('/stories', jsonParser,  (req, res) => {
  const requiredData = ['title', 'content'];
  for (let i=0; i < requiredData.length; i++) {
    const field = requiredData[i];
    if (!(field in req.body)) {
      const msg = `Missing ${field} in request body`;
      console.error(msg);
      return res.status(400).send(msg);
    }
    if (req.body.title.length === 0) {
      const msg = 'Item must have a title';
      console.log(msg);
      return res.status(400).send(msg);
    }
  }
  knex
    .returning(['id', 'title', 'content'])
    .insert({title: req.body.title, content: req.body.content})
    .into('stories')
    .debug(true)
    .then(results => res.status(201, 'created').location(`/stories/${results.id}`).json(results))
    .catch(error => {
      console.error(error);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/stories/:id', jsonParser, (req, res) => {
  // const {title, content} = req.body;
  
  // /***** Never Trust Users! *****/
  
  const id = Number(req.params.id);
  // const item = data.find((obj) => obj.id === id);
  // Object.assign(item, {title, content});
  // res.json(item);
  const requiredFields = ['id','title', 'content'];
  for (let i=0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const msg = `Missing \`${field}\` in request body`;
      console.error(msg);
      return res.status(400).send('Missing a required field.');
    }
  }
  if (id !== req.body.id) {
    const msg = `Request id (${req.params.id}) and request body id (${req.body.id}) must match`;
    console.error(msg);
    return res.status(400).send(msg);
  }
  if (req.body.title.length === 0) {
    const msg = 'Item must have a title';
    console.log(msg);
    res.status(400).send(msg);
  }

  knex('stories')
    .where('id', '=', id)
    .returning(['title', 'content'])
    .update({title: req.body.title, content: req.body.content})
    .debug(true)
    .then(
      results => {
        res.status(200, 'updated').location(`stories/${results.id}`).json(results[0]);
      });      
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/stories/:id', (req, res) => {
  const id = Number(req.params.id);
  // const index = data.findIndex((obj) => obj.id === id);
  // data.splice(index, 1);
  // res.status(204).end();
  knex('stories')
    .where('id', '=', id)
    .del()
    .then(res.status(204).end());
});

module.exports = router;