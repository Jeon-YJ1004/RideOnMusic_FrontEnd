import express from "express";
import SpotifyWebApi from "spotify-web-api-node";
import dotenv from "dotenv";
dotenv.config();

// dotenv.config();
// const app = express();
// spotifyRouter.use(bodyParser.urlencoded({ extended: true }));
// spotifyRouter.use(cors());
// // body-parser 미들웨어 등록
// spotifyRouter.use(bodyParser.json());

const spotifyRouter = express.Router();

const spotifyApi = new SpotifyWebApi({
  redirectUri: process.env.REDIRECT_URI,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});
// SECTION - token
spotifyRouter.post("/refresh", (req, res) => {
  const refreshToken = req.body.refreshToken;
  spotifyApi.setRefreshToken(refreshToken);
  spotifyApi
    .refreshAccessToken()
    .then((data) => {
      res.json({
        accessToken: data.body.accessToken,
        expiresIn: data.body.expiresIn,
      });
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

spotifyRouter.post("/login", (req, res) => {
  const code = req.body.code;
  // spotifyApi.setRedirectURI(process.env.REDIRECT_URI);
  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) => {
      res.json({
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresIn: data.body.expires_in,
      });
    })
    .catch((err) => {
      // res.sendStatus(400);
      console.log(err);
    });
});
// spotifyRouter.get('/callback', (req, res) => {
//   const code = req.query.code;
//   console.log("callback" + code)
//   if (code) {
//     spotifyApi
//       .authorizationCodeGrant(code)
//       .then((data) => {
//         res.json({
//           accessToken: data.body.access_token,
//           refreshToken: data.body.refresh_token,
//           expiresIn: data.body.expires_in,
//         });
//       })
//       .catch((err) => {
//         res.sendStatus(400);
//       });
//   } else {
//     res.send('Authentication failed.');
//   }
// });

// SECTION - user info
spotifyRouter.post("/userprofile", (req, res) => {
  const accessToken = req.body.accessToken;

  spotifyApi.setAccessToken(accessToken);

  spotifyApi
    .getMe()
    .then((data) => {
      // console.log(data.body)
      res.json({
        display_name: data.body.display_name,
        href: data.body.href,
        id: data.body.id,
        images: data.body.images,
        uri: data.body.uri,
        email: data.body.email,
      });
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

// SECTION - playlist
spotifyRouter.post("/createPlaylist", (req, res) => {
  const name = req.body.name;
  const description = req.body.description;
  const accessToken = req.body.accessToken;

  spotifyApi.setAccessToken(accessToken);

  spotifyApi
    .createPlaylist(name, { description: description, public: true, collaborative: true })
    .then(
      function (data) {
        console.log("Created playlist!");
        res.json(data.body);
      },
      function (err) {
        console.log("Something went wrong!", err);
      }
    );
});

spotifyRouter.post("/getPlaylist", (req, res) => {

  const playlistId = req.body.playlistId;
  // const playlistId = "1Y7LZa32wLeB7IMAhrGiwL";
  console.log("getPlaylist!!!!!!!!!" + playlistId);

  const accessToken = req.body.accessToken;
  spotifyApi.setAccessToken(accessToken);

  spotifyApi.getPlaylist(playlistId).then(
    function (data) {
      // console.log("Some information about this playlist", data.body);
      // console.log(data.body);
      res.json(data.body);
    },
    function (err) {
      console.log("Something went wrong!", err);
    }
  );
});

spotifyRouter.post("/getUserPlaylists", (req, res) => {
  const id = req.body.id;
  // console.log("getUserPlaylist " + id);

  const accessToken = req.body.accessToken;

  spotifyApi.setAccessToken(accessToken);

  spotifyApi.getUserPlaylists(id).then(
    function (data) {
      // console.log("Retrieved playlists", data.body);
      res.json(data.body);
    },
    function (err) {
      console.log("Something went wrong in get user Playlist!", err);
    }
  );
});

spotifyRouter.post("/addTracksToPlaylist", (req, res) => {
  const tracks = req.body.tracks;
  const id = req.body.playlistId;
  const accessToken = req.body.accessToken;

  spotifyApi.setAccessToken(accessToken);

  spotifyApi.addTracksToPlaylist(id, tracks).then(
    function (data) {
      console.log("Added tracks to playlist!");
      res.json(data.body);
    },
    function (err) {
      console.log("Something went wrong!", err);
    }
  );
});

spotifyRouter.post("/UpdatePlaylistItems", (req, res) => {
  const tracks = req.body.tracks; // tracks uris
  const id = req.body.playlistId;
  const accessToken = req.body.accessToken;
  let url = `${process.env.SPOTIFY_API}/playlists/${id}/tracks?uris=${tracks}`;
  fetch(url, {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      res.json(data);
    })
    .catch((err) => console.log(err));
});

//!SECTION - search

spotifyRouter.post("/search", (req, res) => {
  const accessToken = req.body.accessToken;
  const keyword = req.body.keyword;
  const offset = req.body.offset;
  spotifyApi.setAccessToken(accessToken);
  // console.log(offset)
  spotifyApi.searchTracks(keyword, { limit: 10, offset: offset }).then(
    function (data) {
      // console.log('Search by ' + keyword, data.body);
      res.json(data.body);
    },
    function (err) {
      console.log("Something went wrong!", err);
    }
  );
});
spotifyRouter.post("/searchSongs", (req, res) => {
  const accessToken = req.body.accessToken;
  const keyword = req.body.keyword;
  const offset = req.body.offset;
  spotifyApi.setAccessToken(accessToken);
  // console.log(offset)
  spotifyApi.searchTracks(keyword, { limit: 10, offset: offset }).then(
    function (data) {
      // console.log('Search by'+ keyword, data.body);
      res.json(data.body);
    },
    function (err) {
      console.log("Something went wrong!", err);
    }
  );
});
// spotifyRouter.post("/searchRecommendTrack", (req, res) => {
//   const accessToken = req.body.accessToken;
//   const song = req.body.song;
//   const artist = req.body.artist;
//   spotifyApi.setAccessToken(accessToken);
//   spotifyApi.searchTracks(`track:${song} artist:${artist}`, { limit: 1, offset: 0 }).then(
//     function (data) {
//       console.log(
//         `Search tracks by "${song}" in the track name and "${artist}" in the artist name`,
//         data.body.tracks.items
//       );
//       res.json(data.body.tracks.items.map((item) => item.uri));
//     },
//     function (err) {
//       console.log("Something went wrong!", err);
//     }
//   );
// });
async function searchRecommendTrack(accessToken, artist, song) {
  // console.log(artist, song,)
  spotifyApi.setAccessToken(accessToken);
  try {
    const data = await spotifyApi.searchTracks(`track:${song} artist:${artist}`, { limit: 1, offset: 0 });
    // console.log('Search result:', data.body);
    return data;
  } catch (err) {
    console.log("Something went wrong!", err);
  }

}

function addTracks(accessToken, playlistId, trakUris, success, fail) {
  console.log("addTrack " + trakUris + "  playlistId " + playlistId);
  spotifyApi.setAccessToken(accessToken);
  spotifyApi.addTracksToPlaylist(playlistId, trakUris).then(success).catch(fail);
}

export default spotifyRouter;
export { addTracks, searchRecommendTrack };
