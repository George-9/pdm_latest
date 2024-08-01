
const express = require('express');
const cors = require('cors')
const app = express();

const path = require('path')

app.use(cors())

app.use(express.json({ 'limit': '50000kb' }))
app.use(express.urlencoded({ 'extended': true, 'limit': '3000kb' }))
app.use(express.static(path.join('./public'), { 'extensions': ['html', 'htm'] }))

module.exports = { app }