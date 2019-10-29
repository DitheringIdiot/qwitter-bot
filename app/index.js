var Twit = require('twit')

var T = new Twit({
  consumer_key:process.env.CONSUMER_KEY,
  consumer_secret:process.env.CONSUMER_SECRET,
  access_token:process.env.ACCESS_TOKEN,
  access_token_secret:process.env.ACCESS_TOKEN_SECRET
})

const handle = 'QwitterBot'


const termsToTrack = [
  'should i leave twitter',
  'should i leave my twitter',
  'should i quit twitter',
  'should i delete my twitter',
  'should i quit my twitter',
  'should i delete twitter',
  'should i get rid of twitter',
  'should i remove twitter',
  'should i say bye to twitter',
  'i should quit twitter',
  'i should leave twitter',
  'i should delete twitter',
  'i want to quit twitter',
  'i want to delete twitter',
  'i want to delete my twitter',
  'i want to leave twitter',
  'i want to get rid of twitter',
  'i need to quit twitter',
  'i need to delete twitter',
  'i need to leave twitter',
  'i need to get rid of twitter',
  'how to quit twitter',
  'how do i quit twitter',
  'how do i leave twitter',
  'how can i quit twitter',
  'how do i delete my twitter',
  'how do i delete twitter',
  'how do you delete twitter',
  'i think i should quit twitter',
  'i think i should leave twitter',
  'i think i should delete twitter'
]

const replies = [
  "Social Media is addictive and can be harmful to your mental health. If you feel low when you use twitter, it\'s probably time to quit. Here\'s how…",
  "If you're feeling down when you use twitter, it's probably time to tweet your goodbyes. When you're ready, here's the instructions to deactivate your account…",
  "Once you leave twitter, you probably won't want to come back. There's so much more to live for! Here's what you need to do to leave…",
  "Quitting social media isn't easy, but is a huge step towards becoming a healthier happier human. Take the leap. Here's what you need to do to quit twitter…",
  "Nobody ever regrets leaving twitter. There are no downsides to quitting. Here's how to deactivate your account…"
]



  T.get('account/verify_credentials', {
    include_entities: false,
    skip_status: true,
    include_email: false
}, onAuthenticated)


function onAuthenticated(err) {

  // Check if authentication has worked and log to the console
  if (err) {
    console.log(err)
  } else {
    console.log('Authentication successful. Running bot...\r\n')
  }


  // Begin monitoring tweets based on the terms we want to track.
  var stream = T.stream('statuses/filter', { track:termsToTrack, tweet_mode:'extended' })

  

  stream.on('tweet', function (tweet) {

    // We perform some checks before we send anyone a tweet.
    if(
      // We don't want our tweet to reply to retweets
      !tweet.retweeted_status
      &&
      // It's important that our twitter bot doesn't respond to itself.
      // So we check if the tweet us from our handle
      tweet.user.screen_name !== handle
      &&
      // The twitter stream api send us a lot of tweets that aren't exact matches of our text
      // so we double check with our isTweetExactMatch function
      isTweetExactMatch(tweet.text)
      ) {
      // If the tweet matches all the above criteria, we send our reply
      sendReply(tweet)
    }
  })

}


function isTweetExactMatch(text){
  // Make sure the text is in lowercase
  text = text.toLowerCase()
  // Check if tweet contains an exact match of the phrases we're looking for.
  return termsToTrack.some(term => text.includes(term))
}

function sendReply(tweet){

  // get the screen name of the twitter account - we'll need to prepend our response with this in order to reply.
  var screenName = tweet.user.screen_name
  // All our tweets will have the same instructions on how to quit twitter
  const instructions = '\n\r\n\rsettings → scroll to the bottom of the page → deactivate your account → deactivate'
  // Now we create the reply - the handle + a random reply from our set of predefined replies + the instructions on how to quit
  var response = '@' + screenName + ' ' + replies[Math.floor(Math.random() * replies.length)] + instructions

  T.post('statuses/update', {

      // To reply we need the id of tweet we're replying to.
      in_reply_to_status_id:tweet.id_str,
      // Status is the content of the tweet, we set it to the response string we made above.
      status:response
      // After we tweet we use a callback function to check if our tweet has been succesful.
  }, onTweeted)

}

// Define a global variable for isAsleep
let isAsleep = false

// Check if our tweet has been successful, if we've reached our rate limit, let people know that our bot is asleep.
function onTweeted(error) {

  // Check if there's been an error
  if (error !== undefined) {

      // Log the error if there is one.
      console.log(error)


      // Check if the error code means the rate limit has been reached.
      if(error.code === 88){

        // Update our profile to let people know our bot has reached it's rate limit.
        T.post('account/update_profile', {
            name:'Qwitter Bot 💤',
            description: 'I\'ve helped too many people quit twitter and have reached my rate limit.'
        }, onTweeted)

        // set the isAsleep variable to true
        isAsleep = true

      }
  } else {
    // if there was no error, check if our bot's profile still says the bot is asleep.
    // If it is asleep update the profile back to it's default.
     if(isAsleep){
       isAsleep = false
       T.post('account/update_profile', {
            name:'Qwitter Bot',
           description: 'I\'m a bot that helps you quit twitter. I appear only when I am needed most'
       }, onTweeted)
     }

  }
}

