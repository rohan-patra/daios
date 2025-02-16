from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from connector.twitter import fetch_twitter
from connector.etherscan import fetch_wallet_activity
from connector.github import fetch_github_activity
from langchain.tools import Tool

app = FastAPI()


class TwitterRequest(BaseModel):
    username: str


class EtherscanRequest(BaseModel):
    wallet_address: str
    chain_id: int = 1


class GithubRequest(BaseModel):
    username: str


@app.post("/twitter")
def get_twitter_data(request: TwitterRequest):
    """Fetch data from Twitter connector."""

    # Wrap it as a LangChain Tool
    twitter_tool = Tool(
        name="TwitterActivityFetcher",
        func=lambda username: fetch_twitter(
            username, tweet_count=10),
        description="Fetches the latest tweets and engagement stats for a given Twitter handle."
    )

    activity_data = twitter_tool.run(request.username)

    return activity_data


@app.post("/etherscan")
def get_etherscan_data(request: EtherscanRequest):
    """Fetch data from Etherscan connector."""
    etherscan_tool = Tool(
        name="EtherscanWalletActivity",
        func=lambda wallet_address, chain_id=1: fetch_wallet_activity(
            wallet_address, chain_id),
        description="Fetches wallet activity (ETH balance, transactions, token transfers) from Etherscan."
    )

    activity_data = etherscan_tool.run(
        request.wallet_address, request.chain_id)

    return activity_data


@app.post("/github")
def get_github_data(request: GithubRequest):

    # Wrap it as a LangChain Tool
    github_activity_tool = Tool(
        name="GitHubActivityFetcher",
        func=lambda username: fetch_github_activity(username),
        description="Fetches GitHub activity stats including total commits, repos contributed to, and stars."
    )

    activity_data = github_activity_tool.run(request.username)

    return activity_data


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
