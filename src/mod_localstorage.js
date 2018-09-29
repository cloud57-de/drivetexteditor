//
// Module LocalStorage
//

let lsname = 'Cloud57TextEditorLocalStorage';
let lsitem = localStorage.getItem(lsname);
let lsitemobj = undefined;
let lsfiles = undefined;

if ( lsitem == null || lsitem == undefined ){
    // Create new data
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
    // Check and convert (if neccessary) found data
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

function update(){
    localStorage.setItem(lsname,JSON.stringify(lsitemobj));
}

function getFiles(){
    return lsfiles;
}

export default {
    getFiles,
    update
}
