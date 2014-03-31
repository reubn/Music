//Smooth Scroll Hack
$('.music').on('touchstart', function (event) {});

//Vars
var music = [];
var hasSpotify;
var audio = $(".player")[0];
var currentSongID = false;
var countryCode;
var isMobile = {
    t: function () {
        return (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/iPhone|iPad|iPod/i) || navigator.userAgent.match(/Opera Mini/i) || navigator.userAgent.match(/IEMobile/i));
    }
};

//Key Controls
$(window).keypress(function (e) {
    if (e.which == 113) {
        if (currentSongID !== false) {
            clickedSONG(currentSongID - 1);
        }
    }
    if (e.which == 101) {
        if (currentSongID !== false) {
            clickedSONG(currentSongID + 1);
        }
    }
});


//Basic Functions
function playSong(url, mode) {
    if (mode === 1) {
        window.frames['invisif'].document.location.href = url;
    } else if (mode === 0) {
        $("#playersrc").attr("src", url);
        audio.pause();
        audio.load();
        audio.play();
    }
}

//Song Links
if (window.location.hash) {
    $.ajax({
        type: 'GET',
        dataType: 'jsonp',
        url: '//embed.spotify.com/oembed/',
        data: {
            url: window.location.hash.replace(/#/g, "spotify:track:")
        }
    }).done(function (data) {
        $('head').append("<style class='chngBG'>body::before{ background-image:url(" + data.thumbnail_url.replace(/cover/g, "640") + ")!important;}</style>");
    });
    playSong(window.location.hash.replace(/#/g, "spotify:track:"), 1);
}

//Detect If Spotify Is Installed
if (!isMobile.t()) {
    $.ajax({
        type: 'GET',
        dataType: 'script',
        timeout: 1000,
        url: 'https://wlunlyjfwn.spotilocal.com:4370/r',
        error: function (jqXHR) {

            if (jqXHR.status == '404') {
                hasSpotify = true;
            } else {
                hasSpotify = false;
            }
            console.info('This ↑ ' + jqXHR.status + ' ↑ is checking if Spotify is installed');
        }

    });
} else {
    if (confirm("Do you want to play via Spotify?")) {
        hasSpotify = true;
    } else {
        hasSpotify = false;
    }

}
//Get Country Code
$.getJSON('http://freegeoip.net/json/', function (data) {
    countryCode = data.country_code;
    //Get basic iTunes Feed
    console.log();
    $.ajax({
        type: 'GET',
        url: "http://itunes.apple.com/" + countryCode + "/rss/topsongs/limit=50/explicit=true/json",
        dataType: 'json',
        success: function (data) {
            var items = data.feed.entry;

            for (var n = 0; n < items.length; n++) {
                var title = items[n]['im:name'].label.replace(/ *\[[^)]*\] *| *\([^)]*\) */g, "");
                var artist = items[n]['im:artist'].label;
                var thumbnail = items[n]['im:image'][2].label.replace(/170x170/g, "340x340");
                if (items[n].link[1]) {
                    var itunesURL = items[n].link[1].attributes.href;
                } else {
                    var itunesURL = false;
                }
                var songInfo = [title, artist, thumbnail, itunesURL, encodeURIComponent(title)];
                music.push(songInfo);
                var songElement = $('<article class="song"><img class="art" src="' + thumbnail + '"><p>' + title + '</p><p>' + artist + '</p></article>').click(clickedSONG);
                $('.music').append(songElement);

            }
        }
    });
});
// Play Song Handler
function clickedSONG(songPos) {
    if (!isNaN(songPos)) {
        var songPosition = songPos;
        currentSongID = songPos;
    } else {
        var songPosition = $(this).index();
        currentSongID = $(this).index();
    }
    console.info("User clicked song");
    var song = music[songPosition];
    var artist = song[1];
    window.document.title = song[0] + ' - ' + song[1];
    audio.pause();
    //IF HAS SPOTIFY
    if (hasSpotify === true) {
        //TRY WITHOUT ARTIST NAME
        console.info("User has Spotify");
        $.get("//ws.spotify.com/search/1/track.json", {
            "q": song[4]
        }, function (data) {
            var num = 0;
            var found = false;
            while (found === false) {
                //IF ARTIST IS MATCH
                if (data.tracks[num].artists[0].name.trim().toLowerCase().split(" ")[0] == artist.trim().toLowerCase().split(" ")[0]) {
                    console.info("Artist matches with only title");
                    var url = data.tracks[num].href;
                    music[songPosition].push(url);
                    history.pushState(url, "", url.replace(/spotify:track:/g, "#"));
                    playSong(url, 1);
                    found = true;

                } else {
                    //IF ARTIST ISNT MATCH
                    console.info("Artist doesnt match with only title");
                    num++;
                    //console.log('False ' + num);
                    found = false;
                }
                // IF TRIED 20 TIMES
                if (num == 20) {
                    console.info("Tried with only title 20 times with no matches");
                    //TRY WITH ARTIST NAME
                    $.get("//ws.spotify.com/search/1/track.json", {
                        "q": song[4] + " " + artist
                    }, function (data) {
                        var num = 0;
                        var found = false;
                        while (found === false) {
                            console.log(data.tracks);
                            if (data.tracks[num]) {
                                var trackItem = num
                            } else {
                                var trackItem = 0
                            }
                            if (data.tracks[trackItem].artists[0].name.trim().toLowerCase().indexOf(artist.trim().toLowerCase().split(" ")[0]) == -1) {
                                var artistNumber = 1
                            } else {
                                var artistNumber = 0
                            }
                            if (data.tracks[trackItem].artists[artistNumber].name.trim().toLowerCase().indexOf(artist.trim().toLowerCase().split(" ")[0]) != -1) {
                                console.info("Artist matches with title and artist");
                                //console.log('True ' + num);
                                var url = data.tracks[trackItem].href;
                                music[songPosition].push(url);
                                history.pushState(url, "", url.replace(/spotify:track:/g, "#"));
                                playSong(url, 1);
                                found = true;
                                break;
                                //IF ARTIST ISNT MATCH WITH ARTIST IN QUERY
                            } else {
                                console.info("Artist doesnt match with title and artist");
                                num++;
                                found = false;
                            }
                            //IF WITH ARTIST IN QUERY TRIED 20 TIMES
                            if (num == 20) {
                                console.info("Tried with title and artist 20 times with no matches");
                                playSong(song[3], 0);
                                break;
                            }
                        }

                    });
                    break;


                }
            }


        });
    } else {
        playSong(song[3], 0);
    }
    $(".chngBG").remove();
    $('head').append("<style class='chngBG'>body::before{ background-image:url(" + song[2] + ")!important;}</style>");
}