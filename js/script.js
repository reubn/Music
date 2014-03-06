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
        $('.music').append('<div class="song" onclick="clickedSONG(\'' + addslashes(thumbnail) + '\',\'' + addslashes(spotifyURL) + '\',\'' + addslashes(itunesURL) + '\')"><img class="art" src="' + addslashes(thumbnail) + '"><p>' + title + '</p><p>' + artist + '</p></div>');

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

function clickedSONG(bgURL, spotifyURL, itunesURL) {
    var audio = $(".player");
    audio[0].pause();
    if (iTunesOnly === false) {
        $.get("//ws.spotify.com/search/1/track", {
            "q": spotifyURL
        }, function (data) {
            var item = data.querySelector("track").getAttribute('href');
            history.pushState(item, "", item.split("spotify:track:").join("#"));
            //window.location.assign("spotify:search:track:" + spotifyURL);
            location.href = item;

        });
    } else {
        $("#playersrc").attr("src", itunesURL);
        audio[0].pause();
        audio[0].load();
        audio[0].play();
    }
    $(".chngBG").remove();
    $('head').append("<style class='chngBG'>body::before{ background-image:url(" + bgURL + ")!important;}</style>");
}