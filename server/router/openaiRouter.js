import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/setHashTag", (req, res) => {
  const hashtags = req.body.hashtags;
  const userInfo = req.body.userInfo;
  const accessToken = req.body.accessToken;

  let testPrompt = "recommend me one song";
  let prompt = `Can you recommend 10 songs based on the following preferences:
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
      max_tokens: 1,
    })
    .then((res) => {
      console.log(res.choices[0].message);
      // const { choices } = res.data;
      const recommendedSongs = res.choices[0].message.content.replace(/\n/g, "");
      console.log(recommendedSongs);
      //TODO - 노래들 spotify 플리에 추가하기
      let recommendedSongUris = [];
      // 노래 검색
      for (let index = 0; index < recommendedSongs.length; index++) {
        const { artist, song } = array[index];
        searchRecommendTrack(
          accessToken,
          artist,
          song,
          ({ data }) => {
            console.log(
              `Search tracks by "${song}" in the track name and "${artist}" in the artist name`,
              data.body
            );
          },
          (error) => {
            console.log(error);
          }
        );
      }
      //노래 추가

      // app.get("/search? q=remaster%2520track%3ADoxy%2520artist%3AMiles%2520Davis", (req, res) => {})
    })
    .catch((error) => {
      console.error("Error calling OpenAI API:", error);
      res.status(500).json({ error: "Failed to generate text from OpenAI API" });
    });
});

export default router;
