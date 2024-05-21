import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
// const lyricsFinder = require("lyrics-finder")
import SpotifyWebApi from "spotify-web-api-node";

import spotifyRouter from "./router/spotifyRouter.js";
import chatgptRouter from "./router/openaiRouter.js";

dotenv.config();
const app = express();
app.use(cors());
// body-parser 미들웨어 등록
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/spotify", spotifyRouter);
app.use("/chatgpt", chatgptRouter);

app.listen(5174);