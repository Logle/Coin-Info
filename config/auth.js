//expose our config directly to our application using modules


//using environmental variables to store API keys
var facebookId = process.env.FACEBOOK_ID;

var facebookSecret = process.env.FACEBOOK_SECRET;

module.exports = {
    'facebookAuth' : {
        'clientID'      :  1398448437115065, // your App ID
        'clientSecret'  :  '2a8f375ef85f7713c095cf4385584d69',// your App Secret
        'callbackURL'   : 'http://localhost:3000/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : 'your-consumer-key-here',
        'consumerSecret'    : 'your-client-secret-here',
        'callbackURL'       : 'http://localhost:3000/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : 'your-secret-clientID-here',
        'clientSecret'  : 'your-client-secret-here',
        'callbackURL'   : 'http://localhost:3000/auth/google/callback'
    }
}