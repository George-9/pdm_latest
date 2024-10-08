import express from 'express';
import cors from "cors";
import bodyParser from 'body-parser';

const app = express();
const limit = "3000mb";

app.use(cors());

app.use(express.json({ 'limit': limit }));
app.use(bodyParser({ 'limit': limit }))
app.use(express.urlencoded({ 'extended': true, 'limit': limit }));
app.use(express.static('./public', { 'extensions': ['html', 'htm'], 'index': false }));

export { app }