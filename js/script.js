//Smooth Scroll Hack
$('.music').on('touchstart', function (event) {});

//Vars
var music = [];
var hasSpotify;
var audio = $(".player")[0];
var currentSongID = false;
var countryCode = "";
var nextSongTimer = false;
var isMobile = {
    t: function () {
        return (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/iPhone|iPad|iPod/i) || navigator.userAgent.match(/Opera Mini/i) || navigator.userAgent.match(/IEMobile/i));
    }
};

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


//Get Country Code
$.getJSON('http://freegeoip.net/json/', function (data) {
    countryCode = data.country_code;
    getFeed(countryCode);
});

//Key Controls
$(window).keypress(function (e) {
    if (e.which == 113) {
        if (currentSongID !== false) {
            clickedSong(currentSongID - 1);
        }
    }
    if (e.which == 101) {
        if (currentSongID !== false) {
            clickedSong(currentSongID + 1);
        }
    }
});

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
                $.ajax({
                    type: 'GET',
                    dataType: 'script',
                    timeout: 1000,
                    url: 'https://wlunlyjfwn.spotilocal.com:4371/r',
                    error: function (jqXHR) {
                        if (jqXHR.status == '404') {
                            hasSpotify = true;
                        } else {
                            if (localStorage.getItem("wantSpotify") == "true") {
                                hasSpotify = true;
                            } else if (localStorage.getItem("wantSpotify") == "false") {
                                hasSpotify = false;
                            } else {
                                if (confirm("Is Spotify installed on this device?\nPress 'Ok' if it is or 'Cancel' if it isn't'")) {
                                    hasSpotify = true;
                                    localStorage.setItem("wantSpotify", "true")
                                } else {
                                    hasSpotify = false;
                                    localStorage.setItem("wantSpotify", "false")
                                }
                            }
                        }
                        console.info('This ↑ ' + jqXHR.status + ' ↑ is checking if Spotify is installed');
                    }

                });
            }
            console.info('This ↑ ' + jqXHR.status + ' ↑ is checking if Spotify is installed');
        }

    });

} else {
    if (localStorage.getItem("wantSpotify") == "true") {
        hasSpotify = true;
    } else if (localStorage.getItem("wantSpotify") == "false") {
        hasSpotify = false;
    } else {
        if (confirm("Is Spotify installed on this device?\nPress 'Ok' if it is or 'Cancel' if it isn't'")) {
            hasSpotify = true;
            localStorage.setItem("wantSpotify", "true")
        } else {
            hasSpotify = false;
            localStorage.setItem("wantSpotify", "false")
        }
    }

}

//Get basic iTunes Feed
function getFeed(countryCode, genre) {
    if (genre) {
        var url = "http://itunes.apple.com/" + countryCode + "/rss/topsongs/limit=50/genre=" + genre + "/explicit=true/json"
    } else {
        var url = "http://itunes.apple.com/" + countryCode + "/rss/topsongs/limit=50/explicit=true/json"
    }
    $('.music').empty();
    music = [];
    $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function (data) {
            var items = data.feed.entry;

            for (var n = 0; n < items.length; n++) {
                var title = items[n]['im:name'].label.replace(/ *\[[^)]*\] *| *\([^)]*\) */g, "");
                var artist = items[n]['im:artist'].label;
                var thumbnail = items[n]['im:image'][2].label.replace(/170x170/g, "340x340");
                var itunesURL;
                if (items[n].link[1]) {
                    itunesURL = items[n].link[1].attributes.href;
                } else {
                    itunesURL = false;
                }
                var songInfo = [title, artist, thumbnail, itunesURL, encodeURIComponent(title)];
                music.push(songInfo);
                var image = $('<img class="art" src="' + thumbnail + '">');
                $('.music').append($('<article class="song"><p>' + title + '</p><p>' + artist + '</p></article>').prepend(image).click(clickedSong));

            }
        }
    });
}

// Play Song Handler
function clickedSong(songPos) {
    var songPosition;
    if (!isNaN(songPos)) {
        songPosition = songPos;
        currentSongID = songPos;
    } else {
        songPosition = $(this).index();
        currentSongID = $(this).index();
    }
    console.info("User clicked song " + songPosition + " (" + numSuffix(songPosition + 1) + ")");
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
                //IF NO SONGS RETURNED
                if (!data.tracks[0]) {
                    console.info("Tried with title and artist 20 times with no matches");
                    playSong(song[3], 0);
                }
                //IF ARTIST IS MATCH
                var artistString;
                for (var key in data.tracks[num].artists) {
                    artistString = artistString + " " + data.tracks[num].artists[key].name.trim().toLowerCase();
                }
                if (artistString.indexOf(artist.trim().toLowerCase().split(" ")[0]) != -1) {
                    console.info("Artist matches with only title");
                    var url = data.tracks[num].href;
                    music[songPosition].push(url);
                    music[songPosition].push(data.tracks[num].length);
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
                        //IF NO SONGS RETURNED
                        if (!data.tracks[0]) {
                            console.info("Tried with title and artist 20 times with no matches");
                            playSong(song[3], 0);
                        }
                        var found = false;
                        while (found === false) {
                            var artistString;
                            for (var key in data.tracks[num].artists) {
                                artistString = artistString + " " + data.tracks[num].artists[key].name.trim().toLowerCase();
                            }
                            if (artistString.indexOf(artist.trim().toLowerCase().split(" ")[0]) != -1) {
                                console.info("Artist matches with title and artist");
                                //console.log('True ' + num);
                                var url = data.tracks[num].href;
                                music[songPosition].push(url);
                                music[songPosition].push(data.tracks[num].length);
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


//Basic Functions
function playSong(url, mode) {
    if (mode === 1) {
        window.frames.invisif.document.location.href = url;
        if (nextSongTimer !== false) {
            clearInterval(nextSongTimer);
        }
        nextSongTimer = setInterval(function () {
            if (currentSongID + 1) {
                clickedSong(currentSongID + 1);
            } else {
                clickedSong(0);
            }
            clearInterval(nextSongTimer);
        }, music[currentSongID][6] * 1000);

    } else if (mode === 0) {
        $("#playersrc").attr("src", url);
        audio.pause();
        audio.load();
        audio.play();
    }
}

// Fun debug suffix func
function numSuffix(num) {
    if (num > 3 && num < 21) // catch teens, which are all 'th'
        sufx = num + 'th';
    else if (num % 10 == 1) // exceptions ending in '1'
        sufx = num + 'st';
    else if (num % 10 == 2) // exceptions ending in '2'
        sufx = num + 'nd';
    else if (num % 10 == 3) // exceptions ending in '3'
        sufx = num + 'rd';
    else
        sufx = num + 'th';

    return sufx
}