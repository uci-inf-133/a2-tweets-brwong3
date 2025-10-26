let written_tweets;

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	//Update with Sentiment
	const headerRow = document.querySelector(".table-striped > thead > tr");
	const newHeading = document.createElement("th");
	newHeading.scope = "col";
	newHeading.textContent = "Sentiment";

	headerRow.appendChild(newHeading);

	//TODO: Filter to just the written tweets
	written_tweets = runkeeper_tweets
		.map(tweet => new Tweet(tweet.text, tweet.created_at))
		.filter(tweet => tweet.written === true);

	const searchCount = document.getElementById("searchCount");
	searchCount.innerText = 0;

	const searchText = document.getElementById("searchText");
	searchText.innerText = "";

}

function addEventHandlerForSearch() {
	//TODO: Search the written tweets as text is entered into the search box, and add them to the table
	const input = document.getElementById("textFilter");
	const searchCount = document.getElementById("searchCount");
	const searchText = document.getElementById("searchText");

	input.addEventListener("input", e => {
		const tweetTable = document.getElementById("tweetTable");
		tweetTable.innerHTML = '';

		if (e.target.value === '') {
			searchCount.innerText = 0;
		}
		else {
			const filteredTweets = written_tweets.filter(tweet => tweet.writtenText.includes(e.target.value));

			searchCount.innerText = `${filteredTweets?.length || 0}`;
			updateTable(filteredTweets);
		}
		searchText.innerText = e.target.value;
	})


}

function updateTable(tweet_array) {
	const tweetTable = document.getElementById("tweetTable");
	
	for(let i = 0; i < tweet_array.length; i++) {
		const tweet = tweet_array[i];
    	tweetTable.insertAdjacentHTML("beforeend", tweet.getHTMLTableRow(i + 1));
	}
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', async function (event) {
	await Tweet.loadLexicons();
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});