import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import { addTracks, searchRecommendTrack } from "./spotifyRouter.js";
dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/setHashTag", async (req, res) => {
  const hashtags = req.body.hashtags;
  const userInfo = req.body.userInfo;
  const accessToken = req.body.accessToken;
  const playlistId = req.body.playlistId;

  console.log("set hashtag " + playlistId);
  let prompt = `Can you recommend 3 songs based on the following preferences:
  Genre: ${hashtags.genre}
  Travel Purpose: ${hashtags.travelPurpose}
  Prefer artists: [${hashtags.artists}]
  Era: ${hashtags.era}  
  and I'm ${userInfo.gender} and ${userInfo.age} years old
  Do not choose songs that are the same artist.
  Do not write any explanations or other words, just reply with the songs.
  Please generate responses in JSON format {artist:song} as an array
  remove the newline characters \\n from content`; //The weather at the travel destination (${weather})

  try {
    const response = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0,
      max_tokens: 200,
    });

    let recommendedSongs = parseSongs(response.choices[0].message.content);
    // console.log("GPT function result: " + recommendedSongs);

    // let recommendedSongs = parseSongs(`[{
    //     "artist": "The Beach Boys",
    //     "song": "Kokomo"
    //   },{
    //     "artist": "Bob Marley",
    //     "song": "Three Little Birds"
    //   },{
    //     "artist": "Eagles",
    //     "song": "Hotel California"
    //   }]`);
    let recommendedSongUris = [];
    recommendedSongs = JSON.parse(recommendedSongs);
    await Promise.all(recommendedSongs.map(async e => {
      const { artist, song } = e;
      const trackResponse = await searchRecommendTrack(accessToken, artist, song);
      const trackItems = trackResponse.body.tracks.items;
      if (trackItems.length > 0) {
        const trackUri = trackItems[0].uri;
        recommendedSongUris.push(trackUri);

      } else {
        console.error("Track not found for artist: " + artist + ", song: " + song);
      }
    }));
    // console.log("Added track to playlist: " + recommendedSongUris);
    await addTracks(accessToken, playlistId, recommendedSongUris);

    // console.log("recommendedSongUris: " + recommendedSongUris);

    res.status(200).json({ message: "Successfully added recommended songs to playlist" });
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    res.status(500).json({ error: "Failed to generate text from OpenAI API" });
  }
});

const parseSongs = (input) => {
  // Remove any leading/trailing whitespace and add brackets if necessary
  let data = input.trim();

  if (!data.startsWith('[')) {
    // Add commas between objects and wrap with brackets to form a valid JSON array
    data = `[${data.replace(/}\s*{/g, '},{')}]`;
  }
  return data;
};

export default router;
