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
    
    doCall(`${url}/ethBalance?address=${addr}`, (res) => {
        // Change necessary values
        console.log("Balance:", res);
        getUserDetails(addr, res)
    })
}

function getAddr(){
    doCall(`${url}/address?address=cause`, (res) => {
        // Change necessary values
        console.log(res)

        getBal(res)

    })
}

getAddr()

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

function donate(){
    let addr = document.getElementById("donate_addr").value;
    let id = 1;
    let amt = document.getElementById("donate_amt").value;
    doCall(`${url}/donate?address=${addr}&id=${id}&amt=${amt}`, (res) => {
        let database = firebase.database().ref('causes');
        database.on('value', function(snapshot){
            snapshot.forEach(snap => {
                if(JSON.parse(snap.val().id) == id) {
                    new_donated = parseFloat(snap.val().donated) + parseFloat(amt);
                    let db = firebase.database().ref('causes/' + snap.key);
                    db.update({
                        donated: new_donated
                    })
                }
            })

            getAddr()
        })
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

function retrieveCauses(){
    let database = firebase.database().ref('causes');
    database.on('value', function(snapshot){
        snapshot.forEach(snap => {
            console.log(snap.val())
            // console.log(`${service_type}_table_body`)
            // document.getElementById(`${service_type}_table_body`).innerHTML += 
            //     `<tr class="clickable-row" value=${snap.key}>
            //     <th scope="row">${snap.key}</th>
            //     <td>${snap.val()["name"]}</td>
            //     <td>${snap.val()["res_addr"]}</td>
            //     <td>${snap.val()["descr"]}</td>
            //     <td>${snap.val()["status"]}</td>
            //     </tr>
            //     `
            document.getElementById("creator").title = `Ethereum Address: ${snap.val()["creator"]}`;
            document.getElementById("cause_1_descr").innerHTML = `<a href="#" style="text-decoration:none">${snap.val()["descr"]}</a>`;
            let percent = 100*snap.val()["donated"]/snap.val()["requirement"];
            document.getElementById("fund_raised_details").innerHTML = 
                `
                <div style="margin-top:-10pt" class="fund-raised-details d-flex flex-wrap justify-content-between align-items-center">
                    <div class="fund-raised-total mt-4">
                        <b>Raised:</b> ${snap.val()["donated"]} ETH
                    </div><!-- .fund-raised-total -->

                    <div class="fund-raised-goal mt-4">
                        <b>Requirement:</b> ${snap.val()["requirement"]} ETH 
                    </div>
                </div>
                <div class="fund-raised-details" style="text-align:center">   
                    <span><i>1 ETH ~ INR 10,000</i></span>
                </div>
                `
            // let percent = 100*parseFloat(snap.val()["donated"])/parseFloat(snap.val()["requirement"]);
            
            console.log("Percent: ", percent);

            causes[snap.val()["id"]] = {
                "creator": snap.val()["creator"],
                "donated": snap.val()["donated"],
                "descr": snap.val()["descr"],
                "requirement": snap.val()["requirement"],
                "withdrawn": snap.val()["withdrawn"],
            }
        })
    })
}

retrieveCauses()




function newAidNeeded(){
    let name = document.getElementById("service_name").value;
    let res_addr = document.getElementById("service_addr").value;
    let descr = document.getElementById("service_descr").value;
    // let payment_mode;
    let service_type = document.getElementById("service_type").value;
    console.log(name, res_addr, descr, service_type);


    firebase.database().ref(`services/${service_type}`).push({
        name: name,
        res_addr: res_addr,
        descr: descr,
        status: "Help Needed",
    });

    alert("Request for Assistance has been recorded")
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

function setDonationDetails(){
    document.getElementById("donate_name").value = user["name"];
    document.getElementById("donate_addr").value = user["addr"];
    document.getElementById("donate_recv_addr").value = causes[1]["creator"];
    document.getElementById("donate_cause").value = causes[1]["descr"];
    document.getElementById("donate_amt").value = 0.25;
}

function setAmt(amt){
    document.getElementById("donate_amt").value = amt;
}



