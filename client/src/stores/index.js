import { useTokenStore } from "@/stores/spotifyToken";
import { usePlaylistStore } from "@/stores/playlist";
import { useSearchStore } from "@/stores/search";
import { useTrackStore } from "@/stores/track";
import { useUserStore } from "@/stores/SpotifyUser";
import { useMemberStore } from "@/stores//memberStore";
import { usePlanStore } from "@/stores/plan";

export default {
  useTokenStore,
  useUserStore,
  usePlaylistStore,
  useSearchStore,
  useTrackStore,
  useMemberStore,
  usePlanStore,
};
