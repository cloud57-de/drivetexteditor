// Imports ******************************************

import DriveAppsUtil from 'drive-apps-util';
import dot from 'dot';

// Data ******************************************

let id = undefined;
let editor = undefined;
let options = {
  "clientId": "758681145932-be7pq7936jb71v6h23h2nen6ivak2vc2.apps.googleusercontent.com",
  "scope": [
    "profile",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.install",
    "https://www.googleapis.com/auth/drive.metadata"
  ]
};
let driveAppsUtil = new DriveAppsUtil(options);

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

function focusEditor() {
    editor.focus();
}

function showLoginError(msg){
    if( msg == "popup_blocked_by_browser"){
        $("#info").html("Login error!<br><span class='red'>" + msg + "</span><br><br>Allow popups and redirects and reload page!");

    } else
    if( msg == "popup_closed_by_user"){
        $("#info").html("Login error!<br><span class='red'>" + msg + "</span><br><br>Reload page and do not close popup!");
    } else
    if( msg == "access_denied"){
        $("#info").html("Login error!<br><span class='red'>" + msg + "</span><br><br>Wrong password or login process canceled!");
    }
}

function initACE(){
    $('#editor').css("visibility","hidden");
    editor = ace.edit("editor");
    editor.renderer.setShowGutter(true);
    editor.setShowPrintMargin(false);
    editor.setOption("wrap", true);
    editor.setOption("indentedSoftWrap", false);
}

// Start/Entrypoint ******************************************

$(function() {
    $("#info").html("Please wait...");
    initACE();
    // Save...
    $('#sbtn').bind("click",saveFile);
    // Check params
    let state = getParam("state");
    if (state == undefined){
        $('#userprofile').remove();
        initClientStandalone();
    } else
    if (state == "installation" || state == "Installation" || state == "install" || state == "Install") {
        initClientInstall();
    } else {
        initClientStandard();
    }
})

// Init and execute ******************************************

function initClientStandalone() {
    $('#main').html( (dot.template( $('#t_oldmain').html() ))({}) );
    $("#opentexteditor").bind("click",function(){
        $('#editor').css('visibility','visible');
        $('#dialog').remove();
        focusEditor()
    })
    initACE();
    uiHideInfo();
    uiShowDesktop();
    editor.gotoLine(0);
    editor.focus();
    $('#editor').css("visibility","hidden");
    setTimeout(function(){editor.resize()},128);
    $('#sbtn').prop('disabled', true);
    $('#fn').prop('disabled', true);
    $('#fn').prop('disabled', true);
    $('#stl').html("Standalone-mode");
    let dialog = $('#dialog');
    dialog.show();
}

function initClientInstall(){
    $('#sbtn').prop('disabled', true);
    driveAppsUtil.init().then(function(){
        driveAppsUtil.login().then(function(user){
            $('#info').html("Installation done.");
        }).catch(function(err){
            showLoginError(err.error);
            console.log(err);
        })
    }).catch(function(err){
        $("#info").html("Initialization error!<br><span class='red'>" + err.error + "</span>");
        console.log(err);
    })
}

function initClientStandard(){
    driveAppsUtil.init().then(function(){
        driveAppsUtil.login().then(function(user){
            exe();
        }).catch(function(err){
            showLoginError(err.error);
            console.log(err);
        })
    }).catch(function(err){
        $("#info").html("Initialization error!<br><span class='red'>" + err.error + "</span>");
        console.log(err);
    });
}

function exe() {
    // User
    $('#userimage').attr("src",gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getImageUrl());
    // Misc
    let state = JSON.parse(getParam("state"));
    if (state == undefined) return;
    if (state.action == "open") {
        id = state.ids[0];
        showContent();
    } else
    if (state.action == "create") {
        id = state.folderId;
        createFile();
    }
}

// Operations ******************************************

function showContent() {
    driveAppsUtil.getDocumentMeta(id).then(
        function(metadata){
            id = metadata.id;
            $('#fn').val(metadata.name);
            driveAppsUtil.getDocumentContent(id).then(
                function(data){
                    editor.setValue(data);
                    editor.gotoLine(0);
                    editor.focus();
                    $('#editor').css("visibility","visible");
                    uiShowDesktop();
                    uiHideInfo();
                    setTimeout(function(){editor.resize()},128);
                },
                function(err){
                    alert("Error! See console for details.");
                    console.log(err);
                }
            );
        },
        function(err){
            alert("Error! See console for details.");
            console.log(err);
        }
    );
}

function createFile(){
    let meta = {
        mimeType : "text/plain",
        name : "NewTextfile",
        parents : [id]
    };
    $('#fn').val(meta.name);
    driveAppsUtil.createDocument(meta,"").then(
        function(resp){
            id = resp.id;
            uiHideInfo();
            uiShowDesktop();
            editor.gotoLine(0);
            editor.focus();
            $('#editor').css("visibility","visible");
            setTimeout(function(){editor.resize()},128);
        },
        function(err){
            id = undefined;
            alert("Error! See console for details.");
            console.log(err);
        }
    )
}

function saveFile(){
    let currentname = $('#fn').val();
    let meta = {
        name : currentname,
        mimeType : "text/plain"
    }
    let content = editor.getValue();
    $('#sbtn').prop('disabled', true);
    $('#stl').html("Saving file, please wait...");
    driveAppsUtil.updateDocument(id, JSON.stringify(meta), content).then(
        function(resp){
            uiShowDesktop();
            uiHideInfo();
            $('#stl').html("File saved.");
            setTimeout(function() {
                $('#stl').html("&nbsp;");
                $('#sbtn').prop('disabled', false);
            }, 1000);
        },
        function(err){
            alert("Error! See console for details.");
            console.log(err);
        }
    )
}

// EOF ******************************************
