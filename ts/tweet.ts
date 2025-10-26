class Tweet {
	private text:string;
    private static positiveWords:Set<String>;
    private static negativeWords:Set<String>;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        //TODO: identify whether the source is a live event, an achievement, a completed event, or miscellaneous.
        if(this.text.startsWith("Just completed") || this.text.startsWith("Just posted")) {
            return 'completed_event';
        }
        else if(this.text.startsWith("Achieved")) {
            return 'achievement';
        }
        else if(this.text.includes("Live")) {
            return 'live_event';
        }
        else {
            return 'miscellaneous';
        }
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        //TODO: identify whether the tweet is written
        return this.text.includes('-');
    }

    get writtenText():string {
        if(!this.written) {
            return "";
        }
        //TODO: parse the written text from the tweet
        const startIndex:number = this.text.indexOf('-') + 1;
        const endIndex:number = Math.min(this.text.indexOf('https'), this.text.indexOf('#Runkeeper'));
        return this.text.substring(startIndex, endIndex).trim();
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        //TODO: parse the activity type from the text of the tweet
        const distanceMatch:RegExpMatchArray | null = this.getDistanceMatch();
        const timeMatch:RegExpMatchArray | null = this.getTimeMatch();

        if (distanceMatch) {
            return distanceMatch[3].toLowerCase() === "activity"
            ? "other"
            : distanceMatch[3].toLowerCase();
        }
        else if (timeMatch) {
            return timeMatch[2].toLowerCase();
        }
        else {
            return 'unknown';
        }
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        //TODO: prase the distance from the text of the tweet
        const match:RegExpMatchArray | null = this.getDistanceMatch();

        if (!match) {
            return 0;
        }
        const parsedDistance:number = parseFloat(match[1])

        return match[2].toLowerCase() === "km" ? parsedDistance / 1.609 : parsedDistance;

    }

    private getDistanceMatch():RegExpMatchArray | null {
        const regex = /(\d+(?:\.\d+)?)\s*(km|mi)\s+([A-Za-z\s]+?)(\s+(with|-))/i;
        const match = this.text.match(regex);
        if(match) {
            return match;
        }
        else {
            return null;
        }
    }

    private getTimeMatch(): RegExpMatchArray | null {
        const regex = /(a)\s+([A-za-z\s]+?)\s+(in)\s+(\d{1,2}:\d{2}(?::\d{2})?)/i
        const match = this.text.match(regex);
        if(match) {
            return match;
        }
        else {
            return null;
        }
    }

    getHTMLTableRow(rowNumber:number):string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        const linkify = (text:string) => {
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            return text.replace(urlRegex, (url) => `<a href="${url}" target="_blank">${url}</a>`)
        }
        
        return `
            <tr>
                <td>${rowNumber}</td>
                <td>${this.activityType}</td>
                <td>${linkify(this.text)}</td>
                <td>${this.determineSentiment()}</td>
            </tr>
        `;
    }

    static async loadLexicons() {
        Tweet.positiveWords = await Tweet.loadWords('data/positive-words.txt');
        Tweet.negativeWords = await Tweet.loadWords('data/negative-words.txt');   
        console.log(Tweet.positiveWords); 
    }

    private static async loadWords(filePath:string):Promise<Set<string>> {
        const response = await fetch(filePath);
        const text = await response.text();
        const words = text.split(/\r?\n/);
        return new Set(words);
    }

    private determineSentiment():string {
        
        let count:number = 0;

        for (let word of this.writtenText.split(" ")) {
        word = word.toLowerCase().replace(/[^a-z0-9'-]/g, "");

            if (Tweet.positiveWords.has(word)) {
                count++;
            } else if (Tweet.negativeWords.has(word)) {
                count--;
            }
        }

        if (count > 0) {
            return "Positive";
        }
        else if (count < 0) {
            return "Negative";
        }
        return "Neutral";
    }   

}