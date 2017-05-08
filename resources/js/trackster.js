/*** Trackster Main Object ***/
var Trackster = {};

// Toggle for sorting initialization
Trackster.songsTitleSortToggle=-1;
Trackster.artistTitleSortToggle=-1;
Trackster.albumTitleSortToggle=-1;
Trackster.popularitySortToggle=-1;
Trackster.lengthSortToggle=-1;


/*
 Sets up the trackster layout after HTML document has loaded.
 */
$(document).ready(function(){

    // Search Button click event: Start searching for tracks.
    $('#search-button').click(function(){
        Trackster.startSearch();
    })

    // Search Input Enter key event: Start searching for tracks.
    $('#search-input').on('keydown',function(key){
        if (key.keyCode==13) {
            Trackster.startSearch();
        }
    })

    // Track List title click event: Sort the content by each column
    $('.table-title').click(function(event){

        //Get tracks list
        var tracks = $('#tracks-list').data('tracks');

        /* If the tracks list is not empty then check which column title has been clicked to perform
           the appropriate sorting on the tracks array of objects. */
        if (tracks.length!=0)
        {
            if($(event.target).is('#song-title')) {
                Trackster.songsTitleSortToggle*=-1;
                tracks.sort(function(a,b){return (a.name.localeCompare(b.name))* Trackster.songsTitleSortToggle; });
            }

            else if($(event.target).is('#artist-title')) {
                Trackster.artistTitleSortToggle*=-1;
                tracks.sort(function(a,b){return (a.artists[0].name.localeCompare(b.artists[0].name))* Trackster.artistTitleSortToggle; });
            }

            else if($(event.target).is('#album-title')) {
                Trackster.albumTitleSortToggle*=-1;
                tracks.sort(function(a,b){return (a.album.name.localeCompare(b.album.name))* Trackster.albumTitleSortToggle; });
            }

            else if($(event.target).is('#popularity-title')) {
                Trackster.popularitySortToggle*=-1;
                tracks.sort(function(a,b){return (a.popularity.toString().localeCompare(b.popularity.toString()))* Trackster.popularitySortToggle; });
            }

            else if($(event.target).is('#length-title')) {
                Trackster.lengthSortToggle*=-1;
                tracks.sort(function(a,b){
                    return (
                            Trackster.millisToMinutesAndSeconds(a.duration_ms).localeCompare(
                                Trackster.millisToMinutesAndSeconds(b.duration_ms)))* Trackster.lengthSortToggle; });
            }

            // Render the tracks on the layout
            Trackster.renderTracks(tracks);
        }
    });
});




/*
 Given an array of track data, create the HTML for a Bootstrap row for each.
 Append each "row" to the container in the body to display all tracks.
 */
Trackster.renderTracks = function(tracks) {
    console.log(tracks);

    // Empty the html content of the tracks list container
    $('#tracks-list').empty();

    // if the tracks array of objects is not empty, then render the tracks!
    if (tracks.length>0) {
        /* Render each track as a row in the tracks list container and placing
         the data of each track in its column with correct grids */
        for (var i=0; i<tracks.length; i++) {

            var trackHtml='<div class="row track">'
                +'<a class="col-xs-1 col-xs-offset-1" target=_blank href="'+tracks[i].preview_url+'">'+'<i id="play-button" class="fa fa-play-circle-o fa-2x" aria-hidden="true"></i></a>'
                +'<span class="col-xs-4">'+tracks[i].name+'</span>'
                +'<span class="col-xs-2">'+tracks[i].artists[0].name+'</span>'
                +'<span class="col-xs-2">'+tracks[i].album.name+'</span>'
                +'<span class="col-xs-1">'+tracks[i].popularity+'</span>'
                +'<span class="col-xs-1">'+Trackster.millisToMinutesAndSeconds(tracks[i].duration_ms)+'</span>'
                +'</div>';

            $('#tracks-list').append(trackHtml);
        }

    }

    // if no tracks were found (if the tracks array is empty) then display an error message!
    else {
        var errorHTML='<p class="error-message">No tracks were found!</p>';
        $('#tracks-list').html(errorHTML); // put the error message element in the tracks-list container

        // make a toast message effect for the error message element
        $('.error-message').stop().fadeIn(400).delay(2000).fadeOut(800);
    }

    // After the tracks list rendering has ended, create an animation transition on the "trackster" title
    setTimeout(function() {
        $('#title-text').removeClass('animate-title');
    }, 800);

};

/*
 Given a search term as a string, query the Spotify API.
 Render the tracks given in the API query response.
 */

Trackster.startSearch = function() {
    $('#title-text').addClass('animate-title');
    var title = $('#search-input').val();
    Trackster.searchTracksByTitle(title);
}


Trackster.searchTracksByTitle = function(title) {
    $.ajax({
        url:'https://api.spotify.com/v1/search?type=track&q='+title,
        datatype:'jsonp',
        success: function(data){
            var tracks = data.tracks.items; //get the tracks data from the url
            $('#tracks-list').data('tracks',tracks); // stick the tracks array of objects on the tracks-list container
            Trackster.renderTracks(tracks); // render the tracks on the layout
        },
        error:  function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
            var tracks=""; // defining an empty array
            Trackster.renderTracks(tracks); /* if url request was failed we will use the renderTracks method with
                                               an empty array so it can display an error message */
        }

    });


};


/*
 Given a number in milliseconds
 the method returns a converted string of mm:ss
 */

Trackster.millisToMinutesAndSeconds = function(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    var temp = minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}
