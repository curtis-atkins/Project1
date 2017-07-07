var activeUser;


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

	    $( ".github-signin-btn" ).click(function() {
	    	console.log("Click event working")
	    	githubSignin();
	    });

	});

	// This keeps tabs on the currently signed in user
	firebase.auth().onAuthStateChanged(function(user) {
	  if (user) {
	    // User is signed in.
	    activeUser = user;
	  } else {
	    // No user is signed in.
	    console.log("No user signed in");
	  }
	});

});
