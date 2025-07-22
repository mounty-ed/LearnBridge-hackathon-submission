from typing import List, Dict
from googleapiclient.discovery import build

def search_youtube_videos(
    query: str,
    api_key: str,
    max_results: int = 10,
    video_duration: str = "medium",
) -> List[Dict]:
    youtube = build("youtube", "v3", developerKey=api_key)
    all_items = []
    seen_ids = set()

    def _search_one():
        # 1) build params dict
        params = {
            "part": "snippet",
            "q": query,
            "type": "video",
            "videoEmbeddable": "true",
            "maxResults": max_results,
            "order": "viewCount",
            "videoDuration": video_duration,
        }

        # 3) execute the search with those params
        resp = youtube.search().list(**params).execute()
        print(resp)
        for item in resp.get("items", []):
            vid = item["id"]["videoId"]
            if vid not in seen_ids:
                seen_ids.add(vid)
                all_items.append(item)

    _search_one()
    return all_items


query = f"Physics - Gravity"
videos = search_youtube_videos(
    query=query,
    api_key="AIzaSyCSxHOF_x-dQs3JDvbSOALzA8-4wiKiuJ8",
    max_results=10,
    video_duration="medium"
)
if not videos:
    raise ValueError(f"No videos found for '{query}'")

# pick the first result (highest-viewed)
print(videos)
best = videos[0]
vid_id = best["id"]["videoId"]
snip   = best["snippet"]

print('best', best)
