function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	const top3 = updateMostPopularActivities(tweet_array);

	const distinctActivities = determineDistinctActivities(tweet_array);

	//TODO: create a new array or manipulate tweet_array to create a graph of the number of tweets containing each type of activity.

	const distinctActivitiesParsed = Object.entries(distinctActivities).map(([activity, count]) => ({
		activity,
		count
	}));

	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    "values": distinctActivitiesParsed
	  },
	  //TODO: Add mark and encoding
	  mark: 'bar',
	  "encoding": {
    	"x": {"field": "activity", "type": "nominal", "title": "Activity"},
    	"y": {"field": "count", "type": "quantitative", "title": "Number of Tweets"},
	  }
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	//TODO: create the visualizations which group the three most-tweeted activities by the day of the week.
	//Use those visualizations to answer the questions about which activities tended to be longest and when.

	renderDistancesByDayOFWeekTop3Activities(tweet_array, top3);

	document.getElementById("longestActivityType").innerHTML = 'bike';
	document.getElementById("shortestActivityType").innerHTML = 'walk';

	document.getElementById("weekdayOrWeekendLonger").innerHTML = 'weekends';

	const button = document.getElementById("aggregate");
	button.style.display = 'block';

	button.addEventListener('click', () => {
		if(button.textContent == 'Show means') {
			renderDistancesByDayOFWeekTop3ActivitiesMean(tweet_array, top3);
			document.getElementById("distanceVis").innerHTML = '';
			button.textContent = 'Show all activites';
		}
		else {
			renderDistancesByDayOFWeekTop3Activities(tweet_array, top3);
			document.getElementById("distanceVisAggregated").innerHTML = '';
			button.textContent = 'Show means';
		}
	}) 
}

function updateMostPopularActivities(tweet_array) {

	const distinctActivities = determineDistinctActivities(tweet_array);

	document.getElementById("numberActivities").innerHTML = Object.keys(distinctActivities).length;

	const entries = Object.entries(distinctActivities);
	entries.sort((a, b) => b[1] - a[1]);
	const top3 = entries.slice(0, 3);

	document.getElementById("firstMost").innerHTML = top3[0][0];
	document.getElementById("secondMost").innerHTML = top3[1][0];
	document.getElementById("thirdMost").innerHTML = top3[2][0];

	return top3.map(([a, b]) => a);
}

function determineDistinctActivities(tweet_array) {
	const distinctActivities = {};
	for (const tweet of tweet_array) {
		if (tweet.activityType === 'unknown') {
			continue;
		}
		else if (tweet.activityType in distinctActivities) {
			distinctActivities[tweet.activityType] += 1;
		} 
		else {
			distinctActivities[tweet.activityType] = 1;
		}
	}
	return distinctActivities;
}

function renderDistancesByDayOFWeekTop3Activities(tweet_array, top3) {
	const dataPoints = filterByTop3(tweet_array, top3);
	const distance_vis_spec = visualizationSpecification(dataPoints, false);

	return vegaEmbed('#distanceVis', distance_vis_spec, {actions:false});
}

function renderDistancesByDayOFWeekTop3ActivitiesMean(tweet_array, top3) {
	const dataPoints = filterByTop3(tweet_array, top3);
	const distance_aggregated_vis_spec = visualizationSpecification(dataPoints, true);

	return vegaEmbed('#distanceVisAggregated', distance_aggregated_vis_spec, {actions:false});
}

function filterByTop3(tweet_array, top3) {
	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	
	let dataPoints = [];

	for (tweet of tweet_array) {
		if (top3.includes(tweet.activityType)) {
			const dayOfWeek = days[tweet.time.getDay()].substring(0, 3);
			dataPoints.push({
				day: dayOfWeek,
				distance: tweet.distance,
				activityType: tweet.activityType
			})
		}
	}

	return dataPoints;
}

function visualizationSpecification(dataPoints, aggregate) {
	vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the distances by day of the week for all of the three most tweeted-about activities",
	  "width": 200,
	  "data": {
	    "values": dataPoints
	  },
	  mark: 'point',
	  "encoding": {
    	"x": {	
			"field": "day", 
			"type": "ordinal", 
			"sort": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
			"scale": { 
				"paddingOuter": 0,
				"padding": 20
			},
			"title": "time (day)",
			"axis": {
				"tickSize": 10, 
				"tickColor": "black",
				"grid": false,
				"labelPadding": 5
			}
		},
    	"y": {
			"field": "distance", 
			"type": "quantitative", 
			"title": "distance",
  			...(aggregate ? { "aggregate": "average" } : {})
		},
		"color": {
			"field": "activityType",
			"type": "ordinal",
			"title": "Activity Type",
			"scale": {
    			"range": ["blue", "orange", "red"]
 			 }
		}
	  }
	};

	return vis_spec;
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});