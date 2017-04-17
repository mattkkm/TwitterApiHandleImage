var app = angular.module('Twitter', ['ngResource', 'ngSanitize']);
app.filter('imageFilter', function(){
  return function(tweets, contains){
    var out = [];
    if (contains) {
      angular.forEach(tweets, function(tweet) {
        if(tweet.entities.media){
          if (tweet.entities.media[0].type === "photo") {
          out.push(tweet);
        }
        }
        
      })
    } 
    else {
      out = tweets;
    }
    return out;
  
  }
})
app.controller('TweetList', function($scope, $resource, $timeout) {

    /**
     * init controller and set defaults
     */
    function init () {

      // set a default username value
      $scope.username = "mattkonicke";
      $scope.userImage = ""
      $scope.onlyImages = false;
      
      // empty tweet model
      $scope.tweetsResult = [];

      // initiate masonry.js
      $scope.msnry = new Masonry('#tweet-list', {
        columnWidth: 320,
        itemSelector: '.tweet-item',
        transitionDuration: 0,
        isFitWidth: true
      });

      // layout masonry.js on widgets.js loaded event
      twttr.events.bind('loaded', function () {
        $scope.msnry.reloadItems();
        $scope.msnry.layout();
      });

      $scope.getTweets();
    }
    $scope.reload = function(){
          twttr.events.bind('loaded', function () {
        $scope.msnry.reloadItems();
        $scope.msnry.layout();
      });
    }
    /**
     * requests and processes tweet data
     */
    function getTweets (paging) {
      //filter by # retweets and with or without profile picture
      var params = {
        action: 'user_timeline',
        user: $scope.username
      };

      if ($scope.maxId) {
        params.max_id = $scope.maxId;
      }

      // create Tweet data resource
      $scope.tweets = $resource('/tweets/:action/:user', params);

      // GET request using the resource
      $scope.tweets.query( { }, function (res) {

        if( angular.isUndefined(paging) ) {
          $scope.tweetsResult = [];
        }

        $scope.tweetsResult = $scope.tweetsResult.concat(res);
        $scope.userImage = $scope.tweetsResult[0].user.profile_image_url;
        $scope.userFollowers = $scope.tweetsResult[0].user.followers_count;
        $scope.userVerified = $scope.tweetsResult[0].user.verified;
        $scope.userDescription = $scope.tweetsResult[0].user.description;
        $scope.userStatusesCount = $scope.tweetsResult[0].user.statuses_count;
        $scope.userFriendsCount = $scope.tweetsResult[0].user.friends_count;
        $scope.userScreenName = $scope.tweetsResult[0].user.screen_name;

      for(var i = 0; i < $scope.tweetsResult.length; i++){
          //check if extended_entities is not undefined extended_entities[i].type =="photo"
          if($scope.tweetsResult[i].entities.media){
            if($scope.tweetsResult[i].entities.media[0].type==='photo'){
              $scope.tweetsResult[i].isPhoto = true;
              console.log($scope.tweetsResult[i].isPhoto);
            }
          }
        }

        // for paging - https://dev.twitter.com/docs/working-with-timelines
        $scope.maxId = res[res.length - 1].id;

        // render tweets with widgets.js
        $timeout(function () {
          twttr.widgets.load();
        }, 30);
      });
    }

    /**
     * binded to @user input form
     */
    $scope.getTweets = function () {
      $scope.maxId = undefined;
      getTweets();
    }

    /**
     * binded to 'Get More Tweets' button
     */
    $scope.getMoreTweets = function () {
      getTweets(true);
    }

    init();
});