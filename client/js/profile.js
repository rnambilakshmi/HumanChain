url="http://localhost:3000"

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

let psswdView = false;

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

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
            console.log("Balance:", res);
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

function togglePsswdView(){
    if(psswdView == false){
        document.getElementById("psswd").type = "text";
        document.getElementById("toggle-psswd").innerHTML = '<i class="fa fa-eye-slash"></i>';
        psswdView = true;
    }
    else if(psswdView == true){
        document.getElementById("psswd").type = "password";
        document.getElementById("toggle-psswd").innerHTML = '<i class="fa fa-eye"></i>';
        psswdView = false;
    }
}


function loadUser(){
    user = JSON.parse(window.localStorage.getItem('user'));
    console.log(user);
    if(user == null){
        document.getElementById("login_btn").style.display = "block";
        document.getElementById("logout_btn").style.display = "none";
        document.getElementById("user_info").innerHTML = "Not Logged In";
        document.getElementById("not-logged-in").style.display = "block";
    }
    else{
        document.getElementById("login_btn").style.display = "none";
        document.getElementById("logout_btn").style.display = "block";
        document.getElementById("not-logged-in").style.display = "none";
        document.getElementById("user_info").innerHTML = "Loading...";

        document.getElementById("name").value = user["name"];
        document.getElementById("email").value = user["email"];
        document.getElementById("psswd").value = user["psswd"];
        document.getElementById("contact").value = user["contact"];
        if(user["addr"] != undefined){
            document.getElementById("addr").value = user["addr"];
            document.getElementById("eth_addr_button").innerHTML = "Update Address";
            // document.getElementById("eth_addr_button").onclick = "updateEthAddr()";
        }
        else{
            document.getElementById("addr").value = "Not Available";
            document.getElementById("eth_addr_button").innerHTML = "Add Address";
            // document.getElementById("eth_addr_button").onclick = "addEthAddr()";
        }

        getBal(user["addr"])
    }
}

function showUpdate(){
    console.log("Update Address")
    document.getElementById("new_addr_div").style.display = "block";
}

function updateEthAddr(){
    document.getElementById("update_spin").style.display = "block";
    new_addr = document.getElementById("new_addr").value;
    email = document.getElementById("email").value;
    
    let key;
    let database = firebase.database().ref('users');
    database.once('value', function(snapshot){
        snapshot.forEach(snap => {
            if(snap.val().email == email) {
                console.log("Reached here")
                // document.getElementById("update_spin").style.display = "none";
                key = snap.key;
            }
        })

        user = {
            name: user["name"],
            email: email,
            psswd: user["psswd"],
            addr: new_addr
        }

        let db = firebase.database().ref('users/' + key);
        db.update({
            addr: new_addr
        })
        window.localStorage.setItem("user", JSON.stringify(user))
        document.getElementById("update_spin").style.display = "none";
        location.reload();
        return;
    })
}


function setTableValues(){

    let service_types = ["medicines", "daily_essentials", "physical_assistance"];

    for(i =0; i < service_types.length; i++){
        console.log(i);
        let service_type = service_types[i];
        
        let database = firebase.database().ref('services/' + service_type);
        if(service_type != "medicines"){
            let type;
            if(service_type == "physical_assistance"){
                type = "Physical Assistance";
            }
            else{
                type = "Daily Essentials";
            }
            console.log("medicine")
            database.once('value', function(snapshot){
                snapshot.forEach(snap => {
                    console.log(snap.val())
                    if(snap.val()["email"] == user["email"]){
                        document.getElementById("no_assistance_found").style.display = "none";
                        document.getElementById(`assistance_table_body`).innerHTML += 
                        `
                        <tr>
                        <td>${snap.key}</th>
                        <td>${snap.val()["res_addr"]}</td>
                        <td>${type}</td>
                        <td>${snap.val()["descr"]}</td>
                        <td>${snap.val()["status"]}</td>
                        </tr>
                        `
                    }

                    if(snap.val()["status"] == `Volunteer: ${user["name"]}`){
                        document.getElementById("no_volunteer_found").style.display = "none";
                        document.getElementById(`volunteer_table_body`).innerHTML += 
                        `
                        <tr>
                        <td>${snap.key}</th>
                        <td>${snap.val()["name"]}</td>
                        <td>${snap.val()["res_addr"]}</td>
                        <td>${type}</td>
                        <td>${snap.val()["descr"]}</td>
                        </tr>
                        `
                    }
                })
            })
        }
        else{
            console.log("other");
            database.once('value', function(snapshot){
                snapshot.forEach(snap => {
                    console.log(snap.val())
                    if(snap.val()["email"] == user["email"]){
                        document.getElementById("no_assistance_found").style.display = "none";
                        document.getElementById(`assistance_table_body`).innerHTML += 
                        `
                        <tr>
                        <td>${snap.key}</th>
                        <td>${snap.val()["res_addr"]}</td>
                        <td>Medicines</td>
                        <td>${snap.val()["descr"]} <br ><a target="_blank" href="https://ipfs.io/ipfs/${snap.val()["prescription_hash"]}"><button class="gradient-bg-button">View Prescription</button></a></td>
                        <td>${snap.val()["status"]}</td>
                        </tr>
                        `
                    }

                    if(snap.val()["status"] == `Volunteer: ${user["name"]}`){
                        document.getElementById("no_volunteer_found").style.display = "none";
                        document.getElementById(`volunteer_table_body`).innerHTML += 
                        `
                        <tr>
                        <td>${snap.key}</th>
                        <td>${snap.val()["name"]}</td>
                        <td>${snap.val()["res_addr"]}</td>
                        <td>Medicines</td>
                        <td>${snap.val()["descr"]} <br ><a target="_blank" href="https://ipfs.io/ipfs/${snap.val()["prescription_hash"]}"><button class="gradient-bg-button">View Prescription</button></a></td>
                        </tr>
                        `
                    }
                    
                })
            })
        }
    }
}



function logout(){
    console.log("Logout");
    window.localStorage.removeItem("user");
    location.reload();
}

function loadFunc(){
    loadUser();
    setTableValues();
}