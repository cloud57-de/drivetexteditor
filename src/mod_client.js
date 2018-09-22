//
// Module Client ******************************************
//

import dot from 'dot';
import h from './mod_helper';
import o from './mod_operations';
import editor from './mod_editor';
import driveappsutil from './mod_driveappsutil';

let lsname = 'Cloud57TextEditorLocalStorage';
let lsitem = localStorage.getItem(lsname);
let lsitemobj = undefined;
let lsfiles = undefined;
if ( lsitem == null || lsitem == undefined ){
    lsitemobj = {
        "name": lsname,
        "version": "0.2.0",
        "files": [{
            "id": "file_" + Date.now(),
            "name": "ReadMeFirst",
            "content": "This small text comes from your browser's local storage."
        }]
    }
    localStorage.setItem(lsname, JSON.stringify(lsitemobj));
    lsfiles = lsitemobj.files;
} else {
    lsitemobj = JSON.parse(lsitem);
    if( lsitemobj.version != "0.2.0"){
        // Do conversions (if neccessary) here...
    }
    lsfiles = lsitemobj.files;
}

function initClientStandalone() {
    let f = function(){
        $('#info').empty();
        $('#stl').html("Standalone-mode");
        // Information dialog
        $('#main').append( $('#t_dialog_info').html() );
        $('#dialog_info').show();
        // Bind function "New"
        $("#newfile").bind("click",function(){
            $('#fn').prop('disabled',false);
            $('#fn').css('color','#f0f0f0');
            $('#fn').val('NewTextfile');
            // Save function
            $('#sbtn').prop('disabled', false);
            $('#sbtn').css('color','#f0f0f0');
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
        })
        // Bind function "Open"
        $("#openfiles").bind("click",function(){
            // Files dialog
            $('#dialog_info').remove();
            $('#main').append( $('#t_dialog_files').html() );
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
            // Create file list
            let t = dot.template( $('#t_file').html() );
            lsfiles.forEach(function(f){
                let r = t({
                    id: f.id,
                    name: f.name
                });
                $('#fileslist').append(r);
            })
            $('#dialog_files').show();
        });
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
