let url = "http://127.0.0.1:3000";

let requests = {};

let causes = {};

var firebaseConfig = {
    apiKey: "AIzaSyAao3z-m_bfaVk6LdAKn1CmOMkMmvFSFZk",
    authDomain: "helpinghand-tsrn.firebaseapp.com",
    databaseURL: "https://helpinghand-tsrn.firebaseio.com",
    projectId: "helpinghand-tsrn",
    storageBucket: "helpinghand-tsrn.appspot.com",
    messagingSenderId: "470363894886",
    appId: "1:470363894886:web:1689fe883434cc644b29a7",
    measurementId: "G-CNTZX4JBX7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// firebase.analytics();

function doCall(url, callback){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.send(null);
}

function getBal(addr){
    
    doCall(`${url}/ethBalance?address=${addr}`, (res) => {
        // Change necessary values
        console.log("Balance:", res);
        getUserDetails(addr, res)
    })
}

function getAddr(){
    doCall(`${url}/address?address=donate`, (res) => {
        // Change necessary values
        console.log(res)

        getUserDetails(res)

        getBal(res)
    })
}

getAddr()

function retrieveAidsNeeded(){
    let service_types = ["medicines", "daily_essentials", "physical_assistance"];

    for(i =0; i < service_types.length; i++){
        let service_type = service_types[i];
        let database = firebase.database().ref('services/' + service_type);
        database.on('value', function(snapshot){
            snapshot.forEach(snap => {
                console.log(snap.val())
                console.log(`${service_type}_table_body`)
                document.getElementById(`${service_type}_table_body`).innerHTML += 
                    `<tr class="clickable-row" value=${snap.key}>
                    <th scope="row">${snap.key}</th>
                    <td>${snap.val()["name"]}</td>
                    <td>${snap.val()["res_addr"]}</td>
                    <td>${snap.val()["descr"]}</td>
                    <td>${snap.val()["status"]}</td>
                    </tr>
                    `
                requests[snap.key] = {
                    "name": snap.val()["name"],
                    "addr": snap.val()["res_addr"],
                    "descr": snap.val()["descr"],
                    "status": snap.val()["status"],
                    "type": service_type
                }
            })
        })
    }
    
}

retrieveAidsNeeded()

function matchAidWithVolunteer(){
    let id = document.getElementById("volunteer_id").value;
    let service_type;
    try{
        service_type = requests[id]["type"];
    }
    catch {
        alert("Invalid ID");
        return
    }
    
    let volunteer = "R. Nambilakshmi";
    try{
        let database = firebase.database().ref('services/' + service_type);
        database.on('value', function(snapshot){
            snapshot.forEach(snap => {
                if(snap.key == id) {
                    let db = firebase.database().ref('services/' + service_type + "/" + snap.key);
                    db.update({
                        status: "Volunteer: " + volunteer
                    })
                }
            })
        })
        
    }
    catch{
        alert("Sorry! Could not process your request")
        return;
    }
    alert("You have been successfully matched to " + requests[id]["name"])
    
}

function getUserDetails(addr, bal){
    let database = firebase.database().ref('users');
    database.on('value', function(snapshot){
        snapshot.forEach(snap => {
            if(snap.val().addr == addr) {
                console.log("Reached here")
                document.getElementById("user_info").innerHTML = `
                <pre style="padding-top:10pt; margin-bottom:-10pt">
<b>Name: &nbsp;</b>${snap.val()["name"]}
<b>Ethereum Address: &nbsp;</b> ${snap.val()["addr"]}
<b>Balance: &nbsp;</b> ${(bal/ 1000000000000000000).toFixed(2)} ETH
                </pre>
                `
                
            }
        })
    })
}