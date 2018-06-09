// Data ******************************************

var id = undefined;
var token = undefined;
var state = undefined;
var editor = undefined;
var gref = {
    "client_id": "758681145932-be7pq7936jb71v6h23h2nen6ivak2vc2.apps.googleusercontent.com",
    "discoveryDocs": ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
};

// Helper ******************************************

function getParam(name) {
    return (new URL(window.location.href)).searchParams.get(name);
}

function uiShowDesktop() {
    $('#desktop').css("visibility", "visible");
}

function uiHideInfo() {
    $('#info').css("visibility", "hidden");
}

function uiReset(){
    $('#impds').remove();
    $('#temain').css("visibility","visible");
    $('#editor').css("visibility","visible");
    editor.focus();
}

function showImpDs(){
    var url = "https://www.cloud57.de/index.html";
    $.get(url, function(data){
        var doc = $.parseHTML(data);
        var imp = $(doc).find("#modalimpressum");
        $('#temain').css("visibility","hidden");
        $('#editor').css("visibility","hidden");
        $('body').append("<div id='impds' class='impds'></div>");
        $('#impds').append(imp);
        $('#closeimpressum').remove();
        $('#modalimpressum').prepend("<h1>Impressum | Datenschutz</h1>");
        $('#modalimpressum').prepend("<a href='javascript:window.uiReset();'>Zurück</a>");
        $('#modalimpressum').css("margin","16px");
    });
}

// Start/Entrypoint ******************************************

$(function() {
    // ACE
    editor = ace.edit("editor");
    editor.renderer.setShowGutter(true);
    editor.setOption("wrap", true);
    editor.setOption("indentedSoftWrap", false);
    // Export some functions
    window.saveFile = saveFile;
    window.showImpDs = showImpDs;
    window.uiReset = uiReset;
    // Check params
    state = getParam("state");
    if (state == undefined) return;
    $("#info").html("Please wait...");
    if (state == "installation" || state == "Installation") {
        gapi.load('client:auth2', initClientInstall);
    } else {
        gapi.load('client:auth2', initClient);
    }
})

// Init and execute ******************************************

function initClientInstall() {
    gref.scope = "https://www.googleapis.com/auth/drive.install";
    gapi.client.init(gref).then(function() {
        gapi.auth2.getAuthInstance().signIn().then(function() {
            $('#info').html("Installation done.");
        }).catch(function(err) {
            $("#info").html("Installation error! " + err.error);
            console.log(err);
        });
    }).catch(function(err) {
        $("#info").html("Installation error! " + err.error);
        console.log(err);
    });
};

function initClient() {
    gref.scope = "https://www.googleapis.com/auth/drive";
    gapi.client.init(gref).then(function() {
        if (gapi.auth2.getAuthInstance().currentUser.get().isSignedIn()) {
            exe();
        } else {
            gapi.auth2.getAuthInstance().signIn().then(function() {
                exe();
            }).catch(function(err) {
                $("#info").html("Error! See console for details.");
                console.log(err);
            });
        }
    }).catch(function(err) {
        $("#info").html("Error! See console for details.");
        console.log(err);
    });
}

function exe() {
    // User
    $('#userimage').attr("src",gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getImageUrl());
    // Misc
    token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true).access_token;
    state = JSON.parse(getParam("state"));
    if (state == undefined) return;
    if (state.action == "open") {
        id = state.ids[0];
        showContent(id);
    } else
    if (state.action == "create") {
        uiHideInfo();
        uiShowDesktop();
        editor.gotoLine(0);
        editor.focus();
    }
}

// Operations ******************************************

function showContent(id) {
    // Get filename
    gapi.client.drive.files.get({
        fileId: id,
        fields: 'name'
    }).then(function(resp) {
        var name = JSON.parse(resp.body).name;
        $('#fn').val(name);
    }).catch(function(err) {
        console.log(err);
        alert("Error! See console for details.");
    });
    // Get content
    $.ajax({
        url: "https://www.googleapis.com/drive/v3/files/" + id + "?alt=media",
        headers: {
            "Authorization": "Bearer " + token
        }
    }).then(function(data) {
        editor.setValue(data);
        editor.gotoLine(0);
        editor.focus();
        uiShowDesktop();
        uiHideInfo();
    }).catch(function(err) {
        console.log(err);
        alert("Error! See console for details.");
    });
}

function saveFile() {
    $('#sbtn').prop('disabled', true);
    $('#stl').html("Saving file, please wait...");
    var name = $('#fn').val();
    content = editor.getValue();
    var folderId = JSON.parse(getParam("state")).folderId;
    if (state.action == "create" && id == undefined) {
        gapi.client.drive.files.create({
            "name": name,
            "mimeType": "text/plain",
            "fields": "id",
            "parents": [folderId]
        }).then(function(resp) {
            id = resp.result.id;
            updateFile(resp.result.id, content);
        }).catch(function(err) {
            console.log(err);
            alert("Error! See console for details.");
            $('#sbtn').prop('disabled', true);
        });
    } else {
        updateFile(id, content, name);
    }
}

function updateFile(id, text, name) {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";
    var metadata = {
        description: 'n/a',
        'mimeType': 'text/plain',
        'name': name
    };
    var multipartRequestBody =
        delimiter + 'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter + 'Content-Type: application/json\r\n\r\n' +
        text +
        close_delim;
    gapi.client.request({
        'path': '/upload/drive/v3/files/' + id,
        'method': 'PATCH',
        'params': {
            'fileId': id,
            'uploadType': 'multipart'
        },
        'headers': {
            'Content-Type': 'multipart/form-data; boundary="' + boundary + '"',
            'Authorization': 'Bearer ' + token
        },
        'body': multipartRequestBody
    }).execute(function(file) {
        uiShowDesktop();
        uiHideInfo();
        $('#stl').html("File saved.");
        setTimeout(function() {
            $('#stl').html("&nbsp;");
            $('#sbtn').prop('disabled', false);
        }, 1000);
    });
};

// EOF ******************************************
