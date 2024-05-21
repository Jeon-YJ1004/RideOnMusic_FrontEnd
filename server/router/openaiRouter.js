import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import { addTracks, searchRecommendTrack } from "./spotifyRouter.js";
dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/setHashTag", (req, res) => {
  const hashtags = req.body.hashtags;
  const userInfo = req.body.userInfo;
  const accessToken = req.body.accessToken;
  const playlistId = req.body.playlistId;

  let recommendedSongUris = [];
  console.log("set hashtag" + playlistId);
  let testPrompt = "recommend me one song";
  let prompt = `Can you recommend 2 songs based on the following preferences:
              Genre: ${hashtags.genre}
              Travel Purpose: ${hashtags.travelPurpose}
              Prefer artists: [${hashtags.artists}]
              Era: ${hashtags.era}  
              and i'm ${userInfo.gender} and ${userInfo.age} years old
              Do not choose songs that are same artist.
              Do not write any explanations or other words, just reply with the songs.
              Please generate responses in JSON format {artist:song} as an array
              remove the newline characters \n from content`; //The weather at the travel destination (${weather})
  openai.chat.completions
    .create({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0,
      max_tokens: 200,
    })
    .then((res) => {
      console.log("지피티 함수");
      // const { choices } = res.data;
      let recommendedSongs = res.choices[0].message.content.replace(/\n/g, "");
      recommendedSongs = JSON.parse(recommendedSongs);
      // console.log("json chatgpt answer " + recommendedSongs);
      //TODO - 노래들 spotify 플리에 추가하기
      for (let index = 0; index < recommendedSongs.length; index++) {
        const { artist, song } = recommendedSongs[index];
        searchRecommendTrack(
          accessToken,
          artist,
          song,
          (response) => {
            const res = response.body.tracks.items.map((item) => item.uri);
            recommendedSongUris.push(res[0]);
            console.log("in for문 " + index);
            addTracks(
              accessToken,
              playlistId,
              res,
              (data) => {
                console.log(data);
              },
              (error) => {
                console.log(error);
              }
            );
            // console.log("in for문 " + recommendedSongUris);
          },
          (error) => {
            console.log(error);
          }
        );
      }
    })
    // .then(() => {
    //   //노래 추가
    //   console.log("recommendedSongUri" + recommendedSongUris);
    //   addTracks(
    //     accessToken,
    //     playlistId,
    //     recommendedSongUris,
    //     (data) => {
    //       console.log(data);
    //     },
    //     (error) => {
    //       console.log(error);
    //     }
    //   );
    // })
    .catch((error) => {
      console.error("Error calling OpenAI API:", error);
      res.status(500).json({ error: "Failed to generate text from OpenAI API" });
    });
});

export default router;
