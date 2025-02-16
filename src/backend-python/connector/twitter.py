import requests
import os

# Set your Twitter API Bearer Token here
BEARER_TOKEN = os.getenv("BEARER_TOKEN")

HEADERS = {"Authorization": f"Bearer {BEARER_TOKEN}"}
BASE_URL = "https://api.twitter.com/2"


def fetch_twitter(username: str, tweet_count: int = 10):
    """Fetch recent tweets and engagement stats for a given Twitter handle."""

    # Get user ID from username
    user_lookup_url = f"{BASE_URL}/users/by/username/{username}"
    user_response = requests.get(user_lookup_url, headers=HEADERS)

    if user_response.status_code != 200:
        return f"Error fetching user: {user_response.status_code} - {user_response.json().get('title', 'Unknown error')}"

    user_data = user_response.json()
    user_id = user_data["data"]["id"]

    # Fetch recent tweets
    tweets_url = f"{BASE_URL}/users/{user_id}/tweets?max_results={tweet_count}&tweet.fields=public_metrics,created_at"
    tweets_response = requests.get(tweets_url, headers=HEADERS)

    if tweets_response.status_code != 200:
        return f"Error fetching tweets: {tweets_response.status_code} - {tweets_response.json().get('title', 'Unknown error')}"

    tweets = tweets_response.json().get("data", [])
    tweet_data = []

    for tweet in tweets:
        tweet_data.append({
            "text": tweet["text"],
            "likes": tweet["public_metrics"]["like_count"],
            "retweets": tweet["public_metrics"]["retweet_count"],
            "date": tweet["created_at"],
            "url": f"https://twitter.com/{username}/status/{tweet['id']}"
        })

    return {
        "username": username,
        "tweet_count": len(tweets),
        "tweets": tweet_data
    }
