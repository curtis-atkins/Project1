
// The first variable is a JSON object with GitHub user info in it. The 2nd is a string with just the display name.
var activeUser;
var activeUsername;
var activeThumbnail;

// This variable stores a boolean tracking whether or not a user is signed in.
var signedIn;
var activeProject;

var redirectToAppHome = false;

// This array should include all file extensions eligable for display on our website. 
// It is used to prevent users from feeding in image files etc that could cause our site problems.
// Do not include periods before file extensions
var acceptableFileTypes = ["js", "html", "css", "php", "rb", "py"];

// Whether or not to keep tabs on a particular active project. Only true when on project page. 
var monitorProject = false;

var userOpenPoints;
var userLifePoints;

var projectReviewsLeft;

var votingDisabled = [];
var repoName;

// This is a function to process all AJAX requests 
function requestJSON(url, callback) {
    $.ajax({
      url: url,
      complete: function(xhr) {
        callback.call(null, xhr.responseJSON);
      }
    });
};

// Function to get current date and time
function getDateTime(){
	var today = new Date();
	var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	var dateTime = date+' '+time;
	return dateTime;
};

function customStringify(array){
	var fileListAsString = array[0];
	
	for (var a = 1; a < array.length; a++){
		fileListAsString = fileListAsString + "%" + array[a]; 
	};
	
	return fileListAsString; 
};

function formatCode(){
	$('#code-holder').removeClass("prettyprint");
	$('#code-holder').removeClass("prettyprinted");
	console.log("Updated")
	$('#code-holder').attr('class', 'prettyprint');
	$.getScript('assets/highlighter/prettify.js', function() {
		prettyPrint();
	});
};

// This function access GitHub and generates a code snippet for display on the project page.
// Path should be from root directory and include file name and extension.
// For testing: generateCodeSnippet("AbcAbcwebd", "TriviaGame", "index.html");
function generateCodeSnippet(username, project, path){
	$.ajax({ 
	    url: 'https://raw.githubusercontent.com/' + username + '/' + project + '/master/' + path, 
	    success: function(data) {    
	        display(data); 
	    } 
	});
	function display(data) {
		// This replaces problematic angle brackets, as in script tags, with escape characters.
		data = data.replace(/</g, "&lt;");
		data = data.replace(/>/g, "&gt;");

	    $('#code-holder').html(data); 
	    formatCode();
	};	
}; 

// This function loads a project to the project page.
function loadProject(){
	var url = window.location.href;
	var getInfo = url.split('.html')[1];
	activeProject = getInfo.split("=")[1];
	monitorProject = true;
};


// This function gets the firebase js library. All JavaScript that uses that library needs to be inside this function.
$.getScript('https://www.gstatic.com/firebasejs/4.1.3/firebase.js', function() {
    


  var config = {
    apiKey: "AIzaSyDXNX8h3-mZpq6Mv-GslQg_ViYmWJ_zuGM",
    authDomain: "occ-code-feedback-site-db.firebaseapp.com",
    databaseURL: "https://occ-code-feedback-site-db.firebaseio.com",
    projectId: "occ-code-feedback-site-db",
    storageBucket: "",
    messagingSenderId: "287198859334"
  };



	firebase.initializeApp(config);

  

	// Stuff related to allowing users to sign in with GitHub
	var provider = new firebase.auth.GithubAuthProvider();
	provider.addScope('gist');

	function githubSignin() {
	   firebase.auth().signInWithPopup(provider)
	   
	   .then(function(result) {
	      var token = result.credential.accessToken;
	      var user = result.user;
			
		  if (redirectToAppHome) {
		  	window.location.replace("app.html");
		  };
	   }).catch(function(error) {
	      var errorCode = error.code;
	      var errorMessage = error.message;
			
	      console.log(error.code)
	      console.log(error.message)
	   });
	}

	// If we want to create a sign out button, we just need to add a button to the site, and create a click event in the document ready section below.
	function githubSignout(){
	   firebase.auth().signOut()
	   
	   .then(function() {
	      console.log('Signout successful!')
	   }, function(error) {
	      console.log('Signout failed')
	   });
	}

	// All click events added here
	$( document ).ready(function() {

		// What happens when a user clicks a sign in button. If user is already signed in, they will be redirected to app.html page. 
		// If not, they will have the opportunity to sign in. 
	    $( ".github-signin-btn" ).click(function() {
	    	console.log("Click event working")
	    	if (signedIn){
	    		console.log("Sign in was successful");
	    		window.location.replace("app.html");
	    	} else if (!signedIn){
	    		// This is what happens if a user attempts to sign in, but the sign in fails. 
	    		// ATTN CHRIS: Can you add some sort of modal or error message to the homepage when this happens?
	    		console.log("Not signed in");
	    		redirectToAppHome = true;
	    		githubSignin();
	    	};
	    });

	    // When a user clicks the button to submit a new GitHub link
	    $('#submit-github-link-btn').on('click', function(e){
	    	e.preventDefault();
	    	$('#review-count').attr('placeholder', 'Up to ' + userOpenPoints);
		    var gitLink = $('#gitLink').val();
		    // For testing: https://github.com/AbcAbcwebd/TriviaGame

		    // Validates GitHub link
		    if (gitLink.indexOf("https://github.com/") < 0){
		    	// Not a proper GitHub link
		    	var linkError = $('<p>').text("Sorry, that's not a valid GitHub link.").css("color", "red");
		    	$('#file-list-holder').append(linkError);
		    	return;
		    }

		    var innerAddress = gitLink.split("com/")[1];
		    var username = innerAddress.split("/")[0];
		    repoName = innerAddress.split("/")[1];
		    var requri   = 'https://api.github.com/repos/' + username + '/' + repoName + '/contents/';
			var userUrl = 'https://api.github.com/users/' + username;
			var userMessage = $('#Message').val();

			var containedDocuments = [];
			var docPaths = [];

			var selectedDocuments = [];
			var selectedPaths = [];

			var thumbnailURL;

			function generateFileList(){
				// This checks to make sure each file is of an acceptable file type and, if it is, adds a button so the user can choose to accept it or not.
				$('#file-list-holder').empty();
				var fileSelectPrompt = $('<p>').text("Which files would you like to post?");
				$('#file-list-holder').append(fileSelectPrompt);
				for (var x = 0; x < containedDocuments.length; x++){
					console.log("For loop running")
					var localFileNameArray = containedDocuments[x].split(".");
					var localFileExtension = localFileNameArray[localFileNameArray.length - 1];
					if (acceptableFileTypes.indexOf(localFileExtension) > -1){
						var fileButton = $('<p>').text(containedDocuments[x]);
						fileButton.attr('class', 'file-name');
						$('#file-list-holder').append(fileButton);
					};
				};
			};

			// Function to get GitHub user info attached to selected repo
			function getUserInfo(address){
				requestJSON(address, function(json) {
					thumbnailURL = json.avatar_url;
				}, function(error){
			    	console.log("Error");
			    	// ATTN: This could display error as well. 
			    });
			};

			// Moves directories within Firebase
			// Adapted from code by katowulf
			function moveFbRecord(oldRef, newRef) {    
			     oldRef.once('value', function(snap)  {
			          newRef.set( snap.val(), function(error) {
			               if( !error ) {  oldRef.remove(); }
			               else if( typeof(console) !== 'undefined' && console.error ) {  console.error(error); }
			          });
			     });
			};

		    
		    // Recursive function to handle files and folders
		    // Level variable is used to track how deep in the recursive function is in order to determine when function in complete.
			function parseFiles(directory, level){
			    requestJSON(directory, function(json) {
			    	if(json.message == "Not Found" || username == '') {
				        console.log("GitHub JSON not found");
				        // ATTN CHRIS: May want to add some kind of an error message to page when this happens. 
				    } else {
				    
						for (var i = 0; i < json.length; i++){
						    if (json[i].size > 0){
						    	containedDocuments.push(json[i].name);
						    	docPaths.push(directory.split("/contents/")[1] + json[i].name);
						    } else if (json[i].size == 0) {
								parseFiles(directory + json[i].name + "/", level++);
						    };
						};
					};
					level--;
					if (level <= 0){
						generateFileList();
					}
			    }, function(error){
			    	console.log("Error");
			    	// ATTN: This could display error as well. 
			    });
		    };

		    getUserInfo(userUrl);
		    parseFiles(requri, 1);


		    $("body").on("click", "p.file-name", function(){
		    	var clickedFile = $(this)[0].innerHTML;
		    	selectedDocuments.push(clickedFile);
		    	var clickedIndex = containedDocuments.indexOf(clickedFile);
		    	selectedPaths.push(docPaths[clickedIndex]);
		    	$(this).remove();
		    });

		    $("body").on("click", "button.submit-info", function(){
				var filesToInclude = customStringify(selectedDocuments);
				var filePaths = customStringify(selectedPaths);

				// Checks if user has enough points
				var pointsUsed = $('#review-count').val();
				if (pointsUsed > userOpenPoints) {
					$('#reviews-error-display').text("Sorry, you don't have enough points. Please pick a lower number.");
					$('#reviews-error-display').css('color', 'red');
				} else {
					userOpenPoints = userOpenPoints - pointsUsed;

					var currentDate = getDateTime();
			    	firebase.database().ref('activeRepoPosts/' + repoName).set({
						projectName: repoName,
						owner: username,
						filesSelected: filesToInclude,
						filePaths: filePaths,
						baseLink: requri,
						message: userMessage,
						thumbnail_url: thumbnailURL,
						datePosted: currentDate,
						reviewsLeft: pointsUsed
					}); 
					firebase.database().ref('userPoints/' + activeUsername).update({
						open_points: userOpenPoints
					});
					$('#myModal').modal('hide');
				};
		    });

		});

		$("#posts-table").on("click", "td.project-link", function(){
			var targetProject = $(this)[0].innerHTML;
			window.location = 'project.html?repo=' + targetProject;
		});




		// When a user adds a new comment on a project.
		$("body").on("click", "button.add-feedback", function(){
			var newComment = $('#comment-input')[0].value;

			var currentTimeStamp = getDateTime();

			firebase.database().ref('activeRepoPosts/' + activeProject + "/comments").push({
				poster: activeUsername,
				thumbnailURL: activeThumbnail,
				message: newComment,
				upvotes: 0,
				downvote: 0,
				timeStamp: currentTimeStamp
			});

			if ($('#comment-input')[0].value.length > 299 && projectReviewsLeft > 0) {
				userOpenPoints++;
				userLifePoints++;
				firebase.database().ref('userPoints/' + activeUsername).update({
					open_points: userOpenPoints,
					all_time_points: userLifePoints 
				});
				projectReviewsLeft--;
				if (projectReviewsLeft === 0){
					moveFbRecord('activeRepoPosts/' + repoName, 'archivedRepoPosts/' + repoName)
				};
				firebase.database().ref('activeRepoPosts/' + repoName).update({
					reviewsLeft: projectReviewsLeft
				});
			}; 
			$('#comment-input').val("");
		});

		$("#comment-input").on("keyup", function(e) {
			$('#status-note').empty();
			var messageLength = $('#comment-input')[0].value.length;
			if (messageLength < 300 && projectReviewsLeft > 0){
				$('#status-note').text("You can post this message, but it's too short to earn you points.");
				$('#status-note').css("color", "red");
			} else if (messageLength >= 300 && projectReviewsLeft > 0) {
				$('#status-note').text("Great! This message meets the minimum length requirement.");
				$('#status-note').css("color", "green");
			} else if (projectReviewsLeft < 1) {
				$('#status-note').text("Sorry, this post has already been retired. Feel free to comment, but you won't earn any points.");
				$('#status-note').css("color", "red");
			};
		});

		$( ".postCode" ).click(function() {
		  if (userOpenPoints >= 3){
		  	$('#myModal').modal('show');
		  } else if (userOpenPoints < 3){
		  	$('#post-error-display').text("Sorry, you don't have enough points. Try reviewing some other projects first.");
		  	$('#post-error-display').css('color', 'red');
		  };
		});

		// Makes site logo redirect to signed in home
		$( ".navbar-brand" ).click(function() {
			window.location = 'app.html';
		});
/*
		$("body").on("click", "button.upvote", function(){
			console.log($(this))
			['data-parent]
		});

		$("body").on("click", "button.downvote", function(){});
*/
	});


	// This keeps tabs on the currently signed in user
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
		    // User is signed in.
		    activeUser = user;
		    activeUsername = user.displayName;
		    signedIn = true;
		    activeThumbnail = user.providerData[0].photoURL;

		    // The GitHub API often returns a displayName value of 'null'. To address this, we replace a null value with a partial version of their email. 
		    // We don't want to display the whole email because it leaves the user vulnerable to spam.
		    // Username now based on login rather than display name. This should sidestep the problem and improve consistency. -- Nevermind
		    if (signedIn){
		    	var userEmail = user.email;
		    	var emailName = userEmail.split("@")[0];
		    	activeUsername = emailName.charAt(0).toUpperCase() + emailName.slice(1);
		    	console.log(activeUsername); 
		    };

		    // Monitors changes in user point count
		    firebase.database().ref('userPoints/' + activeUsername).on("value", function(snapshot){
				var activeUserPointsObj = snapshot.val();
				console.log(activeUserPointsObj)
				userOpenPoints = activeUserPointsObj.open_points;
				userLifePoints = activeUserPointsObj.all_time_points; 

				$('#userPoints').text(userOpenPoints);

				// In case it's a new user
				if (userOpenPoints === (undefined || NaN || null)){
					userOpenPoints = 0;
					userLifePoints = 0;
					firebase.database().ref('userPoints/' + activeUsername).set({
						open_points: userOpenPoints,
						all_time_points: userLifePoints 
					});
				};

				// Makes button to submit link unclickable if user doesn't have enough points
				if (userOpenPoints < 3){
					$('#main-post-code-btn').removeAttr('data-target', '#myModal');
					$('#main-post-code-btn').attr('class', "btn-disabled");
					$('#main-post-code-btn').attr('class', "btn-default");

					$('#post-status').text("Sorry, you don't have enough points to post code. Try reviewing some other people's projects first.");
			    	$('#post-status').css('color', 'red');
				} else if (userOpenPoints >= 3){
					$('#main-post-code-btn').attr('data-target', '#myModal');
					$('#main-post-code-btn').removeAttr('class', "btn-disabled");
					$('#main-post-code-btn').removeAttr('class', "btn-default");
				}
			}, function(error){
				console.log(error);
			});

		} else {
		    // No user is signed in.
		    console.log("No user signed in");
		    signedIn = false;
		};
	});

	// This function populates the homepage with thumbnails for the various posts a user can leave comments on.
	firebase.database().ref('activeRepoPosts/').on("value", function(snapshot){
		var activeRepoPostsObj = snapshot.val();
		$('#posts-table').empty();
		$('#posts-table').prepend('<tr><th>Project</th><th>Creator</th><th>Date Posted</th></tr>');
		for (var key in activeRepoPostsObj) {
			$('#posts-table tr:last').after('<tr><td class="project-link">' + activeRepoPostsObj[key].projectName + '</td><td>' + activeRepoPostsObj[key].owner + '</td><td>' + activeRepoPostsObj[key].datePosted + '</td></tr>');
		};
	}, function(error){
		console.log(error);
	});
	if (monitorProject){
		// This function keeps the project page up to date.
		firebase.database().ref('activeRepoPosts/' + activeProject).on("value", function(snapshot){
			var activeProjectObj = snapshot.val();
			$('#poster-image').attr('src', activeProjectObj.thumbnail_url);
			$('#poster-name').text(activeProjectObj.owner);
			$('#post-date').text(activeProjectObj.datePosted);
			$('#owner-message').text(activeProjectObj.message);

			projectReviewsLeft = activeProjectObj.reviewsLeft;

			// Displays buttons for each of the files a user can view. 
			$('#file-button-holder').empty();
			var fileChoices = [];
			fileChoices = activeProjectObj.filesSelected.split('%');
			for (var y = 0; y < fileChoices.length; y++){
				var fileButton = $('<button>').text(fileChoices[y]).attr('class', 'project-file-button');
				$('#file-button-holder').append(fileButton);
			};

			var localFilePaths = [];
			localFilePaths = activeProjectObj.filePaths.split('%');

			// The first file is displayed by default
			generateCodeSnippet(activeProjectObj.owner, activeProjectObj.projectName, localFilePaths[0]);

			$('#userPoints').text(userOpenPoints);

			// When a user clicks a file button, that file is displayed in the code window.
			$('#file-button-holder').on("click", "button.project-file-button", function(){
				var fileClicked = $(this)[0].innerHTML;
				var clickedIndex = fileChoices.indexOf(fileClicked);
				generateCodeSnippet(activeProjectObj.owner, activeProjectObj.projectName, localFilePaths[clickedIndex]);
			});

		
			// To display comments 
			$('#comment-holder').empty();
			for (var key in activeProjectObj.comments) {
				console.log(key);
				var localMessage = activeProjectObj.comments[key].message;
				var localPoster = activeProjectObj.comments[key].poster;
				var localPhotoURL = activeProjectObj.comments[key].thumbnailURL;

				var localUpvotes = activeProjectObj.comments[key].upvotes;
				var localDownvotes = activeProjectObj.comments[key].downvote;

				// App won't display comments that have gotten a large number of downvotes.
				if (localDownvotes - localUpvotes < 3){
					var messageHTML = '<ul class="comments-list"><li class="comment"><a class="pull-left" href="#"><img alt="avatar" class="avatar-image" src="' + localPhotoURL + '"></a><div class="comment-body"><div class="comment-heading"><h4 class="user">' + localPoster + '</h4><h5 class="time"></h5></div><p>' + localMessage + '</p></div></li></ul><div id="vote-button-holder' + key + '"><button class="upvote" data-parent="' + key + '">' + localUpvotes + ' Likes</button><button class="downvote" data-parent="' + key + '">' + localDownvotes + ' Dislikes</button></div>';
					console.log(messageHTML);
					$('#comment-holder').append(messageHTML);
				};
				
			};

			// To track comment up/down votes
			$("body").on("click", "button.upvote", function(){
				console.log($(this));
				var accessKey = $(this)[0].attributes['data-parent'].nodeValue;
				console.log(accessKey);
				var updatedUpVotes = activeProjectObj.comments[accessKey].upvotes;
				updatedUpVotes++;
				console.log(updatedUpVotes);
				console.log(activeProject);
				firebase.database().ref('activeRepoPosts/' + activeProject + '/comments/' + accessKey).update({
					upvotes: updatedUpVotes 
				}); 

				// Disables additional voting on that comment
				$('#vote-button-holder' + accessKey).html("<p>You liked this.</p>");
				votingDisabled.push(accessKey);
			});

			$("body").on("click", "button.downvote", function(){
				console.log($(this));
				var accessKey = $(this)[0].attributes['data-parent'].nodeValue;
				var updatedDownVotes = activeProjectObj.comments[accessKey].downvote;
				updatedDownVotes++;
				firebase.database().ref('activeRepoPosts/' + activeProject + '/comments/' + accessKey).update({
					downvote: updatedDownVotes 
				}); 

				// Disables additional voting on that comment
				$('#vote-button-holder' + accessKey).html("<p>You disliked this.</p>");
				votingDisabled.push(accessKey);
			});

		//	$('#posts-table').empty();
		//	$('#posts-table').prepend('<tr><th>Project</th><th>Creator</th><th>Date Posted</th></tr>');
		//	for (var key in activeRepoPostsObj) {
		//		$('#posts-table tr:last').after('<tr><td class="project-link">' + activeRepoPostsObj[key].projectName + '</td><td>' + activeRepoPostsObj[key].owner + '</td><td>' + activeRepoPostsObj[key].datePosted + '</td></tr>');
		//	}; 
		}, function(error){
			console.log(error);
		});
	};

});







$(document).ready(function() {
	//reads typed input from search box and stores the values of each keyup
    $("#githubSearch").on("keyup", function(e) {
        let gitName = e.target.value;

        // function that makes an AJAX call to github for the username
        $.ajax({
            url: "https://api.github.com/users/" + gitName,
            //Oauth credentials for https://github.com/settings/applications/556425
            data: {
                client_id: "fddd8379c8347974a701",
                client_secret: "52499fe93bf293c84da22b649a53ff89f25570a3"
            }
        }).done(function(user){
            console.log(user);

            //function that makes a call to specified user's repo
            $.ajax({
                url: "https://api.github.com/users/" + gitName + "/repos",

            	//Oauth credentials for https://github.com/settings/applications/556425
                data: {
                    client_id: "fddd8379c8347974a701",
                    client_secret: "52499fe93bf293c84da22b649a53ff89f25570a3",
                    sort: "created: asc",
                    per_page: 5
                }
            }).done(function(repos) {
                console.log(repos);
                $.each(repos, function(index, repo){
                    $("#posts").append('<div class="well"><div class="row"><div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"><strong>${repo.name}</strong>: ${repo.description}</div><div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 marginTop"><span class="label label-default">Forks: ${repo.forks_count}</span><span class="label label-primary">Watchers: ${repo.watchers_count}</span><span class="label label-success">Stars: ${repo.stargazers_count}</span></div><div class="col-xs-2 col-sm-2 col-md-2 col-lg-2"><a href="${repo.html_url}" target="_blank" class="btn btn-default marginTop">Repo Pages</a></div></div></div>');
                });
            });
    
    $.ajax({
    				url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + location + "&key=AIzaSyDXNX8h3-mZpq6Mv-GslQg_ViYmWJ_zuGM",
    				method: "GET"
    		}).done(function(location){
    			console.log(location);
    			$("#location").append('<div class="well"><div class="row"><div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">');
    		})


		    $("#profileInfo").html(`
			  <div class="panel panel-default">
			    <div class="panel-heading">
			      <h3 class="panel-title">${user.name}</h3>
			    </div>
			    <div class="panel-body">
			      <div class="row">
			        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
			          <img class="thumbnail avatar" src="${user.avatar_url}">
			          <a target="_blank" class = "btn btn-primary btn-block img-responsive" href= "${user.html_url}">View Profile</a>
			        </div>
			       </div>
			      <div class="row">
			        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 marginTop">
			          <span class="label label-default">Public Repos: ${user.public_repos}</span>
			          <span class="label label-primary">Public Gists: ${user.public_gists}</span>
			          <span class="label label-success">Followers: ${user.followers}</span>
			          <span class="label label-info">Following: ${user.following}</span>
			        </div>
			        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 marginTop"
			          <ul class="list-group ">
			            <li class="list-group-item ">Company: ${user.company}</li>
			            <li class="list-group-item">Website/Blog: ${user.blog}</li>
			            <li class="list-group-item">Location: ${user.location}</li>
			            <li class="list-group-item">Member Since: ${user.created_at.slice(0,10)}</li>
			          </ul>
			        </div>
			      </div>
			</div>
		  `);

	    });
    });
});
