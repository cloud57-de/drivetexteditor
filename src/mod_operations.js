//
// Module Operartions ******************************************
//

import h from './mod_helper'
import editor from './mod_editor';
import driveAppsUtil from './mod_driveappsutil';

function showFileContent(id) {
    driveAppsUtil.getDocumentMeta(id).then(
        function(metadata){
            let _id = metadata.id;
            let _name = metadata.name;
            driveAppsUtil.getDocumentContent(_id).then(
                function(data){
                    editor.init();
                    editor.setValue(data);
                    editor.gotoLine(0);
                    editor.focus();
                    $('#info').empty();
                    $('#fn').prop('disabled', false);
                    $('#fn').css('color','#f0f0f0');
                    $('#fn').val(_name);
                    $('#sbtn').prop('disabled', false);
                    $('#sbtn').css('color','#f0f0f0');
                    $('#sbtn').bind("click",saveFile);
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

function createFile(id){
    let meta = {
        mimeType : "text/plain",
        name : "NewTextfile",
        parents : [id]
    };
    driveAppsUtil.createDocument(meta,"").then(
        function(resp){
            let id = resp.id;
            let ostate = h.getParam("state");
            let userId = ostate.userId;
            let nstate = {
                "ids" : [ id ],
                "action" : "open",
                "userId" : userId
            };
            let ourl = window.location.href;
            let ourlarr = ourl.split("/");
            let url = ourlarr[0] + "//" + ourlarr[2] + "/?state=" + JSON.stringify(nstate);
            location.href = encodeURI(url);
        },
        function(err){
            alert("Error! See console for details.");
            console.log(err);
        }
    )
}

function saveFile(){
    h.showLoader();
    $('#editor').css('visibility','hidden');
    let state = JSON.parse(h.getParam("state"));
    let id = state.ids[0];
    let currentname = $('#fn').val();
    let meta = {
        name : currentname,
        mimeType : "text/plain"
    }
    let content = editor.getValue();
    $('#sbtn').prop('disabled', true);
    $('#fn').prop('disabled', true);
    $('#stl').html("Saving file, please wait...");
    driveAppsUtil.updateDocument(id, JSON.stringify(meta), content).then(
        function(resp){
            $('#stl').html("File saved.");
            $('#editor').css('visibility','visible');
            $('#info').empty();
            setTimeout(function() {
                $('#stl').html("&nbsp;");
                $('#sbtn').prop('disabled', false);
                $('#fn').prop('disabled', false);
            }, 1000);
        },
        function(err){
            alert("Error! See console for details.");
            console.log(err);
        }
    )
}

export default {
    showFileContent,
    createFile,
    saveFile
}
