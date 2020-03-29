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

user={}

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
<b>Ethereum Address: &nbsp;</b> ${addr}
<b>Balance: &nbsp;</b> ${(bal/ 1000000000000000000).toFixed(2)} ETH
            </pre>
            `
            
        })
    }
    
}

function getAddr(){
    doCall(`${url}/address?address=cause`, (res) => {
        // Change necessary values
        console.log(res)

        getBal(res)

    })
}


function createCause(){
    // Get value of variables
    let addr;
    let req;
    let descr;

    doCall(`${url}/createCause?address=${addr}&requirement=${req}`, (res) => {
        firebase.database().ref('causes').push({
            id: res.id,
            descr: descr,
            creator: addr,
            requirement: req,
            donated: 0,
            withdrawn: 0
        });
    })
}


function withdraw(){
    let addr;
    let id;
    doCall(`${url}/withdraw?address=${addr}&id=${id}`, (res) => {
        let database = firebase.database().ref('causes');
        database.on('value', function(snapshot){
            snapshot.forEach(snap => {
                if(JSON.parse(snap.val().id) == id) {
                    new_withdrawn = snap.val().donated;
                    let db = firebase.database().ref('causes/' + snap.key);
                    db.update({
                        withdrawn: new_withdrawn
                    })
                }
            })
        })
    })
}

function tip(){
    let addr;
    let volunteer;
    let amt;
    doCall(`${url}/tip?address=${addr}&volunteer=${volunteer}&amt=${amt}`, (res) => {
        console.log(res);
        getBal()
    })
}




function newAidNeeded(){
    document.getElementById("service_success").style.display = "none";
    document.getElementById("service_err").style.display = "none";

    let name = document.getElementById("service_name").value;
    let res_addr = document.getElementById("service_addr").value;
    let descr = document.getElementById("service_descr").value;

    let service_type = document.getElementById("service_type").value;
    if(name == "" || res_addr == "" || descr == "" || service_type == "Type of Service:"){
        document.getElementById("service_err").innerHTML = "Field can't remain empty";
        document.getElementById("service_err").style.display = "block";
        return;
    }
    console.log(name, res_addr, descr, service_type);
    if(service_type != "medicines"){
        firebase.database().ref(`services/${service_type}`).push({
            name: name,
            res_addr: res_addr,
            descr: descr,
            status: "Help Needed",
        });
        document.getElementById("service_success").style.display = "block";
    }
    else{
        prescription_hash = document.getElementById("ipfs_hash").value;
        firebase.database().ref(`services/${service_type}`).push({
            name: name,
            res_addr: res_addr,
            descr: descr,
            status: "Help Needed",
            prescription_hash: prescription_hash
        });
        document.getElementById("service_success").style.display = "block";
    }
    

    // alert("Request for Assistance has been recorded")
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
                
                    user = {
                        "name": snap.val()["name"],
                        "addr": snap.val()["addr"]
                    }
            }
        })
    })
}

function loadUser(){
    user = JSON.parse(window.localStorage.getItem('user'));
    console.log(user);
    if(user == null){
        document.getElementById("login_btn").style.display = "block";
        document.getElementById("logout_btn").style.display = "none";
        document.getElementById("user_info").innerHTML = "Not Logged In";
    }
    else{
        document.getElementById("login_btn").style.display = "none";
        document.getElementById("logout_btn").style.display = "block";
        document.getElementById("user_info").innerHTML = "Loading...";
        getBal(user["addr"])
    }
}

loadUser()

function logout(){
    console.log("Logout");
    window.localStorage.removeItem("user");
    location.reload();
}




