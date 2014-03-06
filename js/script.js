var audio = $(".player");
if (getCookie('iTunesOnly') === 'false') {
    var iTunesOnly = false;
    $('#myonoffswitch').trigger('click');
} else {
    var iTunesOnly = true;
}

if (window.location.hash) {
    hashPlay = window.open(window.location.hash.split("#").join("spotify:track:"));
    hashPlay.close();
}

$.get("//itunes.apple.com/gb/rss/topsongs/limit=50/explicit=true/xml", function (data) {
    var items = data.getElementsByTagName("entry");

    for (var n = 0; n < items.length; n++) {
        var title = items[n].querySelector("name").textContent.split(/ *\([^)]*\) */g).join("");
        var thumbnail = items[n].getElementsByTagName("image")[2].textContent;
        var itunesURL = items[n].getElementsByTagName('link')[1].getAttribute('href');
        var artist = items[n].querySelector('artist').textContent;
        var spotifyURL = encodeURIComponent(title);
        $('.music').append('<div class="song" onclick="clickedSONG(\'' + addslashes(thumbnail) + '\',\'' + addslashes(spotifyURL) + '\',\'' + addslashes(itunesURL) + '\',\'' + artist + '\')"><img class="art" src="' + addslashes(thumbnail) + '"><p>' + title + '</p><p>' + artist + '</p></div>');

    }
});

function setCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) +
        ((exdays == null) ? "" : ("; expires=" + exdate.toUTCString()));
    document.cookie = c_name + "=" + c_value;
}

function getCookie(c_name) {
    var i, x, y, ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name) {
            return unescape(y);
        }
    }
}

function toggleMode() {
    if ($('#myonoffswitch').is(":checked") === true) {
        iTunesOnly = true;
        setCookie('iTunesOnly', 'true', 100);
    } else {
        iTunesOnly = false;
        setCookie('iTunesOnly', 'false', 100);
    }
}

function addslashes(a) {
    return (a + "").replace(/[\\"']/g, "\\$&").replace(/\u0000/g, "\\0");
}
function playiTunes(itunesURL){
$("#playersrc").attr("src", itunesURL);
        audio[0].pause();
        audio[0].load();
        audio[0].play();
}
function clickedSONG(bgURL, spotifyURL, itunesURL, artist) {
    var art = artist;
    //console.log(art.trim().toLowerCase().split(" ")[0]);
    audio[0].pause();
    if (iTunesOnly === false) {
        $.get("//ws.spotify.com/search/1/track", {
            "q": spotifyURL
        }, function (data) {
            var num = 0;
            var found = false;

            while (found === false) {
                //console.log(data.querySelectorAll("artist")[num].textContent.trim().toLowerCase().split(" ")[0]);
                if (data.querySelectorAll("artist")[num].textContent.trim().toLowerCase().split(" ")[0] == art.trim().toLowerCase().split(" ")[0]) {
                    //console.log('True' + num);
                    var url = data.querySelectorAll("track")[num].getAttribute('href');
                    history.pushState(url, "", url.split("spotify:track:").join("#"));
                    //window.location.assign("spotify:search:track:" + spotifyURL);
                    location.href = url;
                    found = true;
                } else {
                    num++;
                    //console.log('False' + num);
                    found = false;
                };
                if(num == 20){
                playiTunes(itunesURL);
                    break;
                }
            }


        });
    } else {
        playiTunes(itunesURL);
    }
    $(".chngBG").remove();
    $('head').append("<style class='chngBG'>body::before{ background-image:url(" + bgURL + ")!important;}</style>");
}