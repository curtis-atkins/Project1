// The first variable is a JSON object with GitHub user info in it. The 2nd is a string with just the display name.
var activeUser;
var activeUsername;

// This variable stores a boolean tracking whether or not a user is signed in.
var signedIn;

var redirectToAppHome = false;

// This array should include all file extensions eligable for display on our website. 
// It is used to prevent users from feeding in image files etc that could cause our site problems.
// Do not include periods before file extensions
var acceptableFileTypes = ["js", "html", "css", "php"];


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
		console.log("Sign in function running")
	   firebase.auth().signInWithPopup(provider)
	   
	   .then(function(result) {
	      var token = result.credential.accessToken;
	      var user = result.user;
			
	      console.log(token)
	      console.log(user)
	//      return "signed in";
		  if (redirectToAppHome) {
		  	window.location.replace("app.html");
		  };
	   }).catch(function(error) {
	      var errorCode = error.code;
	      var errorMessage = error.message;
			
	      console.log(error.code)
	      console.log(error.message)
	//      return "sign in failed";
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
	    	/*var signInStatus = githubSignin();
	    	console.log(signInStatus);
	    	if (signInStatus === "signed in"){
	    		console.log("Sign in was successful");
	    		window.location.replace("app.html");
	    	} else if (signInStatus === "sign in failed"){
	    		// This is what happens if a user attempts to sign in, but the sign in fails. 
	    		// ATTN CHRIS: Can you add some sort of modal or error message to the homepage when this happens?
	    	}; */
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
		    var gitLink = $('#gitLink').val();
		    // https://github.com/AbcAbcwebd/TriviaGame
		    var innerAddress = gitLink.split("com/")[1];
		    var username = innerAddress.split("/")[0];
		    var repoName = innerAddress.split("/")[1];
	//	    var requri   = 'https://api.github.com/users/' + username;
		    var requri   = 'https://api.github.com/repos/' + username + '/' + repoName + '/contents/';
	//	    var requri   = 'https://api.github.com/repos/' + username + '/TriviaGame/contents/';
	//	    var repouri  = 'https://api.github.com/users/' + username + '/repos';
			var innerDirectory = requri;

			var containedDocuments = [];

			// In order to protect performance, the recursive function will only go 5 levels deep.
	//		var levelCount = 0;

			function generateFileList(){
				// This checks to make sure each file is of an acceptable file type and, if it is, adds a button so the user can choose to accept it or not.
				console.log(containedDocuments);
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

		    
		    // Recursive function to handle files and folders
		    // Level variable is used to track how deep in the recursive function is in order to determine when function in complete.
			function parseFiles(directory, level){
			    requestJSON(directory, function(json) {
			    	console.log(json);
			    	if(json.message == "Not Found" || username == '') {
				        console.log("GitHub JSON not found");
				        // ATTN CHRIS: May want to add some kind of an error message to page when this happens. 
				    } else {
				    
					    console.log("Parse initiated for " + directory)
						for (var i = 0; i < json.length; i++){
						    console.log("Found " + json[i])
						    if (json[i].size > 0){
						    	containedDocuments.push(json[i].name);
						    } else if (json[i].size == 0) {
						    	console.log("Going recursive on " + directory + directory[i].name + "/")
						//    	levelCount++;
						    	console.log(containedDocuments);
		//				    	parseFiles(directory + directory[i].name);
						//    	requestJSON(directory + directory[i].name + "/", parseFiles(json));
								parseFiles(directory + json[i].name + "/", level++);
						    };
						};
					};
					console.log("Check completed")
					level--;
					console.log("Level count: " + level);
					if (level <= 0){
						console.log("Recursive function complete.")
						generateFileList();
					}
			    }, function(error){
			    	console.log("Error");
			    	// ATTN: This could display error as well. 
			    });
		    };

		    parseFiles(requri, 1);
		    

		    console.log(containedDocuments);

		});

	});

	// This keeps tabs on the currently signed in user
	firebase.auth().onAuthStateChanged(function(user) {
	  if (user) {
	    // User is signed in.
	    activeUser = user;
	    activeUsername = user.displayName;
	    signedIn = true;

	    // The GitHub API often returns a displayName value of 'null'. To address this, we replace a null value with a partial version of their email. 
	    // We don't want to display the whole email because it leaves the user vulnerable to spam.
	    if (signedIn){
	    	var userEmail = user.email;
	    	var emailName = userEmail.split("@")[0];
	    	activeUsername = emailName.charAt(0).toUpperCase() + emailName.slice(1);
	    	console.log(activeUsername);
	    };
	  } else {
	    // No user is signed in.
	    console.log("No user signed in");
	    signedIn = false;
	  }
	});

});


// This is a function to process all AJAX requests 
function requestJSON(url, callback) {
    $.ajax({
      url: url,
      complete: function(xhr) {
        callback.call(null, xhr.responseJSON);
      }
    });
};

/*
function testFunction(){
	$.ajax({
      url: 'https://api.github.com/users/AbcAbcwebd',
      complete: function(xhr) {
        console.log(xhr);
      }
    });
};
*/
