// Initialize Firebase
// var ref = new Firebase("https://www.gstatic.com/firebasejs/4.1.3/firebase.js");
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

	// All click events added here
	$( document ).ready(function() {
	    $( "#sign-in-btn" ).click(function() {
	  		event.preventDefault();
	  		console.log("Function running")
	  		var email = $('#email-input').val();
	  		var password = $('#password-input').val();
	  		/*
	  		THIS IS FOR SIGNING IN WITH GITHUB
	  		firebase.auth().signInWithPopup(provider).then(function(result) {
	  			console.log("Inner function running")
			  // This gives you a GitHub Access Token. You can use it to access the GitHub API.
			  var token = result.credential.accessToken;
			  // The signed-in user info.
			  var user = result.user;
			  // ...
			}).catch(function(error) {
			  // Handle Errors here.
			  var errorCode = error.code;
			  var errorMessage = error.message;
			  // The email of the user's account used.
			  var email = error.email;
			  // The firebase.auth.AuthCredential type that was used.
			  var credential = error.credential;
			  // ...
			});
			*/
			console.log(email)
			console.log(password)
			firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
		        // Handle Errors here.
		        var errorCode = error.code;
		        var errorMessage = error.message;
		        // [START_EXCLUDE]
		        if (errorCode == 'auth/weak-password') {
		          alert('The password is too weak.');
		        } else {
		          alert(errorMessage);
		        }
		        console.log(error);
		        // [END_EXCLUDE]
		    });
		});
	});

});
