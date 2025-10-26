function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;	

	updateTweetDates(tweet_array);
	const completedEvents = updateTweetCategories(tweet_array);
	updateUserWrittenTweers(tweet_array, completedEvents);
}

function updateTweetDates(tweet_array) {
	firstTweet = tweet_array[0];
	lastTweet = tweet_array[0];

	for(tweet of tweet_array) {
		if (tweet.time < firstTweet.time) {
			firstTweet = tweet;
		}
		if (tweet.time > lastTweet.time) {
			lastTweet = tweet;
		}
	}

	document.getElementById('firstDate').innerHTML = firstTweet.time.toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC'
	});
	document.getElementById('lastDate').innerHTML = lastTweet.time.toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC'
	});
}

function updateTweetCategories(tweet_array) {
	completedEvents = tweet_array.filter(tweet => tweet.source == 'completed_event').length;
	document.getElementsByClassName('completedEvents')[0].innerHTML = completedEvents;
	completedEventsPct = completedEvents * 100/tweet_array.length
	document.getElementsByClassName('completedEventsPct')[0].innerHTML = completedEventsPct.toFixed(2) + '%';

	liveEvents = tweet_array.filter(tweet => tweet.source == 'live_event').length;
	document.getElementsByClassName('liveEvents')[0].innerHTML = liveEvents;
	liveEventsPct = liveEvents * 100/(tweet_array.length);
	document.getElementsByClassName('liveEventsPct')[0].innerHTML = liveEventsPct.toFixed(2) + '%';

	achievements = tweet_array.filter(tweet => tweet.source == 'achievement').length;
	document.getElementsByClassName('achievements')[0].innerHTML = achievements;
	achievementsPct = achievements * 100/(tweet_array.length);
	document.getElementsByClassName('achievementsPct')[0].innerHTML = achievementsPct.toFixed(2) + '%';

	miscellaneous = tweet_array.filter(tweet => tweet.source == 'miscellaneous').length;
	document.getElementsByClassName('miscellaneous')[0].innerHTML = miscellaneous;
	miscellaneousPct = miscellaneous * 100/(tweet_array.length);
	document.getElementsByClassName('miscellaneousPct')[0].innerHTML = miscellaneousPct.toFixed(2) + '%'; 

	return completedEvents;
}

function updateUserWrittenTweers(tweet_array, completedEvents) {
	document.getElementsByClassName('completedEvents')[1].innerHTML = completedEvents;
	userWrittenTweets = tweet_array.filter(tweet => tweet.source == 'completed_event' && tweet.written).length;
	userWrittenTweetsPct = userWrittenTweets * 100 / tweet_array.length;
	document.getElementsByClassName('written')[0].innerHTML = userWrittenTweets;
	document.getElementsByClassName('writtenPct')[0].innerHTML = userWrittenTweetsPct.toFixed(2) + '%';

}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});