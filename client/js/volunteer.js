let url = "http://127.0.0.1:3000";

let requests = {};

let causes = {};

let user={};

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

function doPost(url, body, callback){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("POST", url, true); // true for asynchronous 
    xmlHttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    // xmlHttp.setRequestHeader('Access-Control-Allow-Headers', '*');
    // xmlHttp.setRequestHeader('Access-Control-Allow-Origin', '*');
    // xmlHttp.setRequestHeader('Access-Control-Allow-Methods', 'POST');
    xmlHttp.send(body);
}

function getBal(addr){
    if(addr == null){
        console.log("No address!")
        document.getElementById("user_info").innerHTML = `
        <pre style="padding-top:10pt; margin-bottom:-10pt">
<b>Name: &nbsp;</b>${user["name"]}
<b>Email ID: &nbsp;</b>${user["email"]}
        </pre>
        `
    }
    else{
        doCall(`${url}/ethBalance?address=${addr}`, (bal) => {
            // Change necessary values
            console.log("Balance:", bal);
            document.getElementById("user_info").innerHTML = `
            <pre style="padding-top:10pt; margin-bottom:-10pt">
<b>Name: &nbsp;</b>${user["name"]}
<b>Email ID: &nbsp;</b>${user["email"]}
<b>Ethereum Address: &nbsp;</b> ${addr}
<b>Balance: &nbsp;</b> ${(bal/ 1000000000000000000).toFixed(2)} ETH
            </pre>
            `
            
        })
    }
    
}


function retrieveAidsNeeded(){
    let service_types = ["medicines", "daily_essentials", "physical_assistance"];

    for(i =0; i < service_types.length; i++){
        console.log(i);
        let service_type = service_types[i];
        
        let database = firebase.database().ref('services/' + service_type);
        if(service_type != "medicines"){
            console.log("medicine")
            database.on('value', function(snapshot){
                document.getElementById(`${service_type}_table_body`).innerHTML = "";
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
        else{
            console.log("other");
            database.on('value', function(snapshot){
                document.getElementById(`${service_type}_table_body`).innerHTML = "";
                snapshot.forEach(snap => {
                    console.log(snap.val())
                    console.log(`${service_type}_table_body`)
                    document.getElementById(`${service_type}_table_body`).innerHTML += 
                        `<tr class="clickable-row" value=${snap.key}>
                        <th scope="row">${snap.key}</th>
                        <td>${snap.val()["name"]}</td>
                        <td>${snap.val()["res_addr"]}</td>
                        <td>${snap.val()["descr"]} <br ><a target="_blank" href="https://ipfs.io/ipfs/${snap.val()["prescription_hash"]}"><button class="gradient-bg-button">View Prescription</button></a></td>
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
    
}

function matchAidWithVolunteer(){
    document.getElementById("service_err").style.display = "none";
    document.getElementById("service_success").style.display = "none";
    document.getElementById("volunteer_spin").style.display = "block";
    
    let id = document.getElementById("volunteer_id").value;
    let service_type;
    try{
        service_type = requests[id]["type"];
    }
    catch {
        document.getElementById("service_err").innerHTML = "Invalid ID";
        document.getElementById("service_err").style.display = "block";
        document.getElementById("volunteer_spin").style.display = "none";
        return;
    }
    let aid;
    let found = false;
    let volunteer = user["name"];
    try{
        let database = firebase.database().ref('services/' + service_type);
        database.once('value', function(snapshot){
            console.log(snapshot);
            snapshot.forEach(snap => {
                if(snap.key == id) {
                    found = true;
                    if(snap.val()["status"] != "Help Needed"){
                        aid = null;
                        document.getElementById("volunteer_spin").style.display = "none";
                        document.getElementById("service_err").innerHTML = "Sorry! This request had already been matched.";
                        document.getElementById("service_err").style.display = "block";
                        return true; 
                    
                    }
                    else{
                        aid = snap.val();
                    }

                }
            })

            if(found == true){
                if(aid != null){
                    let email_body = 
                    `
                    Hi ${aid["name"]}, 
                    <br /><br />
                    Your request for '<b><i>${aid["descr"]}</i></b>' has been matched to a volunteer.
                    <br /><br />
                    Following are the details of the volunteer:
                    <br />
                    <b>Name: </b>${user["name"]}
                    <br />
                    <b>Email ID: </b>${user["email"]}
                    <br /><br />
                    Regards,
                    <br />
                    <b><i>HumanChain Team</i></b>
                    `

                    notifyByEmail(aid["email"], email_body, (resp) => {
                        console.log(resp)
                        if(resp["err"] == null){
                            let db = firebase.database().ref('services/' + service_type + "/" + id);
                            db.update({
                                status: "Volunteer: " + volunteer
                            })
                            document.getElementById("volunteer_spin").style.display = "none";
                            document.getElementById("service_success").innerHTML = "You have been successfully matched to " + aid["name"];
                            document.getElementById("service_success").style.display = "block";
                            return ;
                        }
                        else{
                            document.getElementById("volunteer_spin").style.display = "none";
                            document.getElementById("service_err").innerHTML = "Sorry! Could not process your request. Please try again.";
                            document.getElementById("service_err").style.display = "block";
                        }
                        
                    });
                }
            }
            else{
                document.getElementById("volunteer_spin").style.display = "none";
                document.getElementById("service_err").innerHTML = "Sorry! Request not found.";
                document.getElementById("service_err").style.display = "block";
            }

            
        })
        
    }
    catch{
        document.getElementById("volunteer_spin").style.display = "none";
        document.getElementById("service_err").innerHTML = "Sorry! Could not process your request";
        document.getElementById("service_err").style.display = "block"
        return;
    }
    
}

// function getUserDetails(addr, bal){
//     let database = firebase.database().ref('users');
//     database.on('value', function(snapshot){
//         snapshot.forEach(snap => {
//             if(snap.val().addr == addr) {
//                 console.log("Reached here")
//                 document.getElementById("user_info").innerHTML = `
//                 <pre style="padding-top:10pt; margin-bottom:-10pt">
// <b>Name: &nbsp;</b>${snap.val()["name"]}
// <b>Ethereum Address: &nbsp;</b> ${snap.val()["addr"]}
// <b>Balance: &nbsp;</b> ${(bal/ 1000000000000000000).toFixed(2)} ETH
//                 </pre>
//                 `
                
//             }
//         })
//     })
// }

function loadUser(){
    user = JSON.parse(window.localStorage.getItem('user'));
    console.log(user);
    if(user == null){
        document.getElementById("login_btn").style.display = "block";
        document.getElementById("logout_btn").style.display = "none";
        document.getElementById("user_info").innerHTML = "Not Logged In";
        disableButtons();
    }
    else{
        document.getElementById("login_btn").style.display = "none";
        document.getElementById("logout_btn").style.display = "block";
        document.getElementById("user_info").innerHTML = "Loading...";
        getBal(user["addr"])
    }
}

function disableButtons(){
    let btns = document.getElementsByClassName("btn-after-login");
    for (let i = 0; i < btns.length; i++){
        btns[i].disabled = true;
    }
    document.getElementById("service_warn").style.display = "block";
}

function logout(){
    console.log("Logout");
    window.localStorage.removeItem("user");
    location.reload();
}



function loadFunc(){
    loadUser();
    retrieveAidsNeeded();
}

function notifyByEmail(email_id, email_body, callback) {
    // Todo
    let body = JSON.stringify({
        email_id: email_id,
        email_body: email_body
    })

    doPost(`${url}/sendMail`, body, (res) => {
        console.log(res)
        callback(JSON.parse(res))
    })
}