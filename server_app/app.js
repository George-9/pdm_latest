import express from 'express';
import cors from "cors";

const app = express();
const limit = "50mb";

app.use(cors());

app.use(express.json({ 'limit': limit }));
app.use(express.urlencoded({ 'limit': limit }));
app.use(express.static('./public', { 'extensions': ['html', 'htm'], 'index': false }));

export { app }