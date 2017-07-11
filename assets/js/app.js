$(document).ready(function() {

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

// This is a function to process all AJAX requests 
function requestJSON(url, callback) {
    $.ajax({
      url: url,
      complete: function(xhr) {
        callback.call(null, xhr.responseJSON);
      }
    });
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
		console.log("Sign in function running")
	   firebase.auth().signInWithPopup(provider)
	   
	   .then(function(result) {
	      var token = result.credential.accessToken;
	      var user = result.user;
			
	      console.log(token)
	      console.log(user)
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
		    var gitLink = $('#gitLink').val();
		    // For testing: https://github.com/AbcAbcwebd/TriviaGame
		    var innerAddress = gitLink.split("com/")[1];
		    var username = innerAddress.split("/")[0];
		    var repoName = innerAddress.split("/")[1];
		    var requri   = 'https://api.github.com/repos/' + username + '/' + repoName + '/contents/';
	//		var innerDirectory = requri;
			var userMessage = $('#Message').val();

			var containedDocuments = [];

			var selectedDocuments = [];

			function generateFileList(){
				// This checks to make sure each file is of an acceptable file type and, if it is, adds a button so the user can choose to accept it or not.
				console.log(containedDocuments);
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
						    	console.log(containedDocuments);
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


		    $("body").on("click", "p.file-name", function(){
		    	var clickedFile = $(this)[0].innerHTML;
		    	console.log($(this));
		    	console.log(clickedFile);
		    	selectedDocuments.push(clickedFile);
		    	$(this).remove();
		    	console.log(selectedDocuments);
		    });

		    $("body").on("click", "button.submit-info", function(){
	//	    $('.submit-info').on('click', function(e){
				var fileListAsString = JSON.stringify(selectedDocuments);
		    	console.log("Submit button clicked");
		    	firebase.database().ref('activeRepoPosts/' + repoName).set({
					projectName: repoName,
					owner: activeUsername,
					filesSelected: fileListAsString,
					baseLink: requri,
					message: userMessage
				}); 
				$('#myModal').modal('hide');
		    });

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
                    $("#posts").append(`
        <div class="well">
          <div class="row">
            <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
              <strong>${repo.name}</strong>: ${repo.description}
            </div>
            <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 marginTop">
              <span class="label label-default">Forks: ${repo.forks_count}</span>
              <span class="label label-primary">Watchers: ${repo.watchers_count}</span>
              <span class="label label-success">Stars: ${repo.stargazers_count}</span>
            </div>
            <div class="col-xs-2 col-sm-2 col-md-2 col-lg-2">
              <a href="${repo.html_url}" target="_blank" class="btn btn-default marginTop">Repo Pages</a>
            </div>
          </div>
        </div>
      `);
    });
  });
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
  `)
        })
    })
})
})
