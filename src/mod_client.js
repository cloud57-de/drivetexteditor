//
// Module Client ******************************************
//

import dot from 'dot';
import h from './mod_helper';
import o from './mod_operations';
import editor from './mod_editor';
import driveappsutil from './mod_driveappsutil';

//
// Local storage (standalone-mode)
//

let lsname = 'Cloud57TextEditorLocalStorage';
let lsitem = localStorage.getItem(lsname);
let lsitemobj = undefined;
let lsfiles = undefined;
if ( lsitem == null || lsitem == undefined ){
    lsitemobj = {
        "name": lsname,
        "version": "0.2.0", // This is the version of the local storage format,
                            // not the version of the Cloud57 Text Editor
        "files": [{
            "id": "file_" + Date.now(),
            "name": "ReadMeFirst",
            "content": "This small text comes from your browser's local storage."
        }]
    }
    localStorage.setItem(lsname, JSON.stringify(lsitemobj));
    lsfiles = lsitemobj.files;
} else {
    try{
        lsitemobj = JSON.parse(lsitem);
        if( lsitemobj.version != "0.2.0"){
            // Do conversions (if neccessary) here...
        }
        lsfiles = lsitemobj.files;
    } catch(e) {
        // Conversion of local storage content from Cloud57 Text Editor version 0.1.0
        lsitemobj = {
            "name": lsname,
            "version": "0.2.0",
            "files": [{
                "id": "file_" + Date.now(),
                "name": "Textfile in your local storage",
                "content": lsitem
            }]
        }
        localStorage.setItem(lsname, JSON.stringify(lsitemobj));
        lsfiles = lsitemobj.files;
    }
}

//
// Local helper
//

function createFileslist(icon){
    $('#fileslist').empty();
    if (lsfiles.length > 0) {
        let t = dot.template( $('#t_file').html() );
        lsfiles.forEach(function(f){
            let r = t({
                id: f.id,
                name: f.name,
                icon: icon
            });
            $('#fileslist').append(r);
        })
    } else {
        $('#fileslist').html("<div class='red'><i>Currently there are no files in your browser's local storage.</i></div>");
    }
}

//
// The clients
//

function initClientStandalone() {
    let f = function(){
        $('#info').empty();
        $('#stl').html("Standalone-mode");
        // Information dialog
        $('#main').append( $('#t_dialog_info').html() );
        $('#dialog_info').show();
        // Bind function "New"
        $("#newfile").bind("click",function(){
            // Prepare GUI
            $('#fn').prop('disabled',false);
            $('#fn').css('color','#f0f0f0');
            $('#fn').val('NewTextfile');
            $('#sbtn').prop('disabled', false);
            $('#sbtn').css('color','#f0f0f0');
            // Bind function to save a text to the browser's local storage
            $('#sbtn').bind("click",function(){
                lsfiles.push({
                    "id" : "file_" + Date.now(),
                    "name" : $('#fn').val(),
                    "content" : editor.getValue()
                })
                lsitemobj.files = lsfiles;
                localStorage.setItem(lsname,JSON.stringify(lsitemobj));
                editor.focus();
            });
            // Open editor
            $('#editor').css('visibility','visible');
            $('#dialog_info').remove();
            editor.gotoLine(0);
            editor.focus();
        });
        // Bind function "Open"
        $("#openfiles").bind("click",function(){
            $('#dialog_info').remove();
            $('#main').append( $('#t_dialog_openfiles').html() );
            createFileslist("open_in_browser");
            $('#dialog_files').show();
            // Bind function to open a file from the browser's local storage
            $('#fileslist').bind("click",function(e){
                let id = e.target.id;
                if( id.startsWith('file_') ){
                    lsfiles.forEach(function(f){
                        if( f.id == id ){
                            $('#fn').prop('disabled',false);
                            $('#fn').css('color','#f0f0f0');
                            $('#fn').val(f.name)
                            editor.setValue(f.content);
                            // Save function
                            $('#sbtn').prop('disabled', false);
                            $('#sbtn').css('color','#f0f0f0');
                            $('#sbtn').bind("click",function(){
                                lsfiles.forEach(function(f){
                                    if( f.id == id ){
                                        f.content = editor.getValue();
                                        f.name = $('#fn').val();
                                    }
                                })
                                lsitemobj.files = lsfiles;
                                localStorage.setItem(lsname,JSON.stringify(lsitemobj));
                                editor.focus();
                            });
                            // Open editor
                            $('#editor').css('visibility','visible');
                            $('#dialog_files').remove();
                            editor.gotoLine(0);
                            editor.focus();
                        }
                    })
                }
            });
        });
        // Bind function "Delete"
        $("#deletefiles").bind("click",function(){
            $('#dialog_info').remove();
            $('#main').append( $('#t_dialog_deletefiles').html() );
            createFileslist("delete_forever");
            $('#dialog_files').show();
            // Bind function to delete a file from the browser's local storage
            $('#fileslist').bind("click",function(e){
                let id = e.target.id;
                if( id.startsWith('file_') ){
                    lsfiles.forEach(function(f){
                        if( f.id == id ){
                            lsfiles.splice(lsfiles.indexOf(f),1);

                        };
                    });
                    lsitemobj.files = lsfiles;
                    localStorage.setItem(lsname, JSON.stringify(lsitemobj));
                    createFileslist("delete_forever");
                }
            });
        });
        // Init the editor
        editor.init();
    }
    setTimeout(f,1024); // Wait some time to enjoy the loader :)
}

function initClientInstall(){
    driveappsutil.init().then(function(){
        driveappsutil.login().then(function(user){
            $('#info').html("Installation done.");
        }).catch(function(err){
            h.showLoginError(err.error);
            console.log(err);
        })
    }).catch(function(err){
        $("#info").html("Initialization error!<br><span class='red'>" + err.error + "</span>");
        console.log(err);
    })
}

function initClientStandard(){
    driveappsutil.init().then(function(){
        driveappsutil.login().then(function(user){
            try{
                $('#userimage').attr("src",gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getImageUrl());
                $('#userprofile').css("visibility","visible");
                let state = JSON.parse(h.getParam("state"));
                if (state == undefined) return;
                if (state.action == "open") {
                    let id = state.ids[0];
                    o.showFileContent(id);
                } else
                if (state.action == "create") {
                    let id = state.folderId;
                    o.createFile(id);
                }
            } catch(e) {
                $("#info").html("Error!<br><span class='red'>" + e + "</span><br><br>The URL seems to be incorrect.");
            }
        }).catch(function(err){
            h.showLoginError(err.error);
            console.log(err);
        })
    }).catch(function(err){
        $("#info").html("Initialization error!<br><span class='red'>" + err.error + "</span>");
        console.log(err);
    });
}

export default {
    initClientInstall,
    initClientStandalone,
    initClientStandard
}
