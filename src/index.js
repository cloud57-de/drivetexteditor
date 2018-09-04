// Imports ******************************************

import DriveAppsUtil from 'drive-apps-util';
import dot from 'dot';

// Data ******************************************

let id = undefined;
let editor = undefined;
let driveAppsUtil = new DriveAppsUtil({
  "clientId": "758681145932-be7pq7936jb71v6h23h2nen6ivak2vc2.apps.googleusercontent.com",
  "scope": [
    "profile",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.install",
    "https://www.googleapis.com/auth/drive.metadata"
  ]
});

// Helper ******************************************

function getParam(name) {
    return (new URL(window.location.href)).searchParams.get(name);
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
    $('#sbtn').bind("click",saveFile);
    switch( getParam("state") ){
        case null:
            $('#userprofile').remove();
            initClientStandalone();
            break;
        case "install":
        case "Install":
        case "installation":
        case "Installation":
            $('#userprofile').remove();
            initClientInstall();
            break;
        default:
            initClientStandard();
            break;
    }
})

// Init and execute ******************************************

function initClientStandalone() {
    $('#fn').prop('disabled', true);
    $('#fn').prop('disabled', true);
    $('#stl').html("Standalone-mode");

    $('#info').remove();
    $('#main').append( $('#t_dialog').html() );
    $('#dialog').show();
    $("#opentexteditor").bind("click",function(){
        $('#editor').css('visibility','visible');
        $('#dialog').remove();
        editor.focus();
    })
    initACE();
}

function initClientInstall(){
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
            try{
                $('#userimage').attr("src",gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getImageUrl());
                initACE();
                let state = JSON.parse(getParam("state"));
                if (state == undefined) return;
                if (state.action == "open") {
                    id = state.ids[0];
                    showFileContent();
                } else
                if (state.action == "create") {
                    id = state.folderId;
                    createFile();
                }
                $('#info').remove();
                $('#sbtn').prop("disabled",false);
            } catch(e) {
                $("#info").html("Error!<br><span class='red'>" + e + "</span><br><br>The URL seems to be incorrect.");
            }
        }).catch(function(err){
            showLoginError(err.error);
            console.log(err);
        })
    }).catch(function(err){
        $("#info").html("Initialization error!<br><span class='red'>" + err.error + "</span>");
        console.log(err);
    });
}

// Operations ******************************************

function showFileContent() {
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
