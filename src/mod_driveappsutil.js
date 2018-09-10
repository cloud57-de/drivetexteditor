//
// Module Drive Apps Util ******************************************
//

import driveappsutil from 'drive-apps-util';

let dau = new driveappsutil({
  "clientId": "758681145932-be7pq7936jb71v6h23h2nen6ivak2vc2.apps.googleusercontent.com",
  "scope": [
    "profile",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.install",
    "https://www.googleapis.com/auth/drive.metadata"
  ]
});

export default dau;
