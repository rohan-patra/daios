import requests

GITHUB_API_BASE = "https://api.github.com"
HEADERS = {"Accept": "application/vnd.github.v3+json"}


def fetch_github_activity(username: str):
    """Fetch comprehensive GitHub activity data for a user."""
    data = {"username": username}

    # Fetch user repositories
    repos_url = f"{GITHUB_API_BASE}/users/{username}/repos"
    repos_response = requests.get(repos_url, headers=HEADERS)

    if repos_response.status_code != 200:
        return f"Error fetching repositories: {repos_response.status_code} - {repos_response.json().get('message', 'Unknown error')}"

    repos = repos_response.json()

    total_stars = 0
    repo_data = []
    for repo in repos:
        total_stars += repo["stargazers_count"]
        repo_data.append({
            "name": repo["name"],
            "stars": repo["stargazers_count"],
            "forks": repo["forks_count"],
            "url": repo["html_url"]
        })

    data["repositories"] = repo_data
    data["total_repo_stars"] = total_stars

    # Fetch commit activity
    commit_activity_url = f"{GITHUB_API_BASE}/search/commits?q=author:{username}"
    commit_response = requests.get(commit_activity_url, headers=HEADERS)

    if commit_response.status_code == 200:
        data["total_commits"] = len(commit_response.json().get("items", []))
    else:
        data["total_commits"] = "Unknown (rate-limited or restricted)"

    # Fetch repositories the user has contributed to
    events_url = f"{GITHUB_API_BASE}/users/{username}/events/public"
    events_response = requests.get(events_url, headers=HEADERS)

    if events_response.status_code == 200:
        events = events_response.json()
        contributed_repos = set()
        for event in events:
            if event.get("type") in ["PushEvent", "PullRequestEvent", "IssueCommentEvent"]:
                repo_name = event["repo"]["name"]
                contributed_repos.add(repo_name)

        data["contributed_repos"] = list(contributed_repos)
    else:
        data["contributed_repos"] = "Unknown (rate-limited or restricted)"

    return data
