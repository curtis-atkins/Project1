// Initialize Firebase
// var ref = new Firebase("https://www.gstatic.com/firebasejs/4.1.3/firebase.js");

// var config;
// var firebase;

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

	function githubSignin() {
		console.log("Sign in function running")
	   firebase.auth().signInWithPopup(provider)
	   
	   .then(function(result) {
	      var token = result.credential.accessToken;
	      var user = result.user;
			
	      console.log(token)
	      console.log(user)
	   }).catch(function(error) {
	      var errorCode = error.code;
	      var errorMessage = error.message;
			
	      console.log(error.code)
	      console.log(error.message)
	   });
	}

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
	    /*$( "#sign-in-btn" ).click(function() {
	  		event.preventDefault();
	  		console.log("Function running")
	  		var email = $('#email-input').val();
	  		var password = $('#password-input').val(); */

			/*
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
		    */

		/*    function toggleSignIn() {
		      if (!firebase.auth().currentUser) {
		        // [START createprovider]
		        var provider = new firebase.auth.GithubAuthProvider();
		        // [END createprovider]
		        // [START addscopes]
		        provider.addScope('repo');
		        // [END addscopes]
		        // [START signin]
		        firebase.auth().signInWithRedirect(provider);
		        // [END signin]
		      } else {
		        // [START signout]
		        firebase.auth().signOut();
		        // [END signout]
		      }
		    };*/
//		});

	    $( ".github-signin-btn" ).click(function() {
	    	console.log("Click event working")
	    	githubSignin();
	    });

	});

});
