$(document).ready(function() {

        //reads typed input from search box and stores the values of each keyup
    $("#githubSearch").on("keyup", function(e) {
        let gitName = e.target.value;

        // function that makes an AJAX call to github for the username
        $.ajax({
            url: "https://api.github.com/users/" + gitName,
            //Oauth credentials for https://github.com/settings/applications/556425
            data: {
                client_id: "e6866007f0ad96c78ea9",
                client_secret: "d28da9518dc3c050797c4af11f4ed1dba49a6011"
            }
        }).done(function(user){
            console.log(user);

            //function that makes a call to specified user's repo
            $.ajax({
                url: "https://api.github.com/users/" + gitName + "/repos",

            //Oauth credentials for https://github.com/settings/applications/556425
                data: {
                    client_id: "e6866007f0ad96c78ea9",
                    client_secret: "d28da9518dc3c050797c4af11f4ed1dba49a6011",
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
            <div class="col-xs-2 col-sm-2 col-md-2 col-lg-2" marginTop>
              <a href="${repo.html_url}" target="_blank" class="btn btn-default">Repo Pages</a>
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
          <a target="_blank" class = btn btn-primary btn-block img-responsive" href= "${user.html_url}">View Profile</a>
        </div>
      <div class="row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 marginTop">
          <span class="label label-default">Public Repos: ${user.public_repos}</span>
          <span class="label label-primary">Public Gists: ${user.public_gists}</span>
          <span class="label label-success">Followers: ${user.followers}</span>
          <span class="label label-info">Following: ${user.following}</span>
        </div>
      
        <div class="col-xs-8 col-sm-8 col-md-8 col-lg-8"
          <ul class="list-group marginTop">
            <li class="list-group-item ">Company: ${user.company}</li>
            <li class="list-group-item">Website/Blog: ${user.blog}</li>
            <li class="list-group-item">Location: ${user.location}</li>
            <li class="list-group-item">Member Since: ${user.created_at}</li>
          </ul>
        </div>
      </div>
  `)
        })
    })
})