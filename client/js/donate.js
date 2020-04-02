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

// function getBal(addr){
    
//     doCall(`${url}/ethBalance?address=${addr}`, (res) => {
//         // Change necessary values
//         console.log("Balance:", res);
//         getUserDetails(addr, res)
//     })
// }

// function getAddr(){
//     doCall(`${url}/address?address=cause`, (res) => {
//         // Change necessary values
//         console.log(res)

//         getBal(res)

//     })
// }

// getAddr()

function donate(){
    let addr = document.getElementById("donate_addr").value;
    let id = 1;
    let amt = document.getElementById("donate_amt").value;
    let found_key = "";
    let donated_amt;
    doCall(`${url}/donate?address=${addr}&id=${id}&amt=${amt}`, (res) => {
        let database = firebase.database().ref('causes');
        database.on('value', function(snapshot){
            snapshot.forEach(snap => {
                console.log("Hi there")
                if(JSON.parse(snap.val().id) == id) {
                    found_key = snap.key;
                    donated_amt = snap.val().donated;
                    return;
                }
            })
        })
        new_amt = donated_amt + parseFloat(amt);
        let db = firebase.database().ref('causes/' + found_key);

        db.update({
            donated: new_amt
        })
        console.log(res);
        document.getElementById("donation_crypto_success").innerHTML += res;
        document.getElementById("donation_crypto_success").style.display = "block";
        // window.location.reload();
    })
}

function retrieveCauses(){
    let database = firebase.database().ref('causes');
    database.on('value', function(snapshot){
        snapshot.forEach(snap => {
            console.log(snap.val())
            // console.log(`${type}_table_body`)
            // document.getElementById(`${type}_table_body`).innerHTML += 
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
                <div class="fund-raised-details d-flex flex-wrap justify-content-between align-items-center">
                    <div class="fund-raised-total">
                        <b>Raised:</b> ${snap.val()["donated"]} ETH
                    </div><!-- .fund-raised-total -->

                    <div class="fund-raised-goal">
                        <b>Requirement:</b> ${snap.val()["requirement"]} ETH 
                    </div>
                </div>
                <div class="fund-raised-details exchange" style="text-align:center">   
                    <span><i>Fetching latest exchange rates...</i></span>
                </div>
                `
            // let percent = 100*parseFloat(snap.val()["donated"])/parseFloat(snap.val()["requirement"]);
            getExchangeRate();
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


// function getUserDetails(addr, bal){
//     let database = firebase.database().ref('users');
//     database.on('value', function(snapshot){
//         snapshot.forEach(snap => {
//             if(snap.val().addr == addr) {
//                 console.log("Reached here")
//                 document.getElementById("user_info").innerHTML = `
//                         <pre style="padding-top:10pt; margin-bottom:-10pt">
// <b>Name: &nbsp;</b>${snap.val()["name"]}
// <b>Ethereum Address: &nbsp;</b> ${snap.val()["addr"]}
// <b>Balance: &nbsp;</b> ${(bal/ 1000000000000000000).toFixed(2)} ETH
//                         </pre>
//                     `
                
//                     user = {
//                         "name": snap.val()["name"],
//                         "addr": snap.val()["addr"]
//                     }
//             }
//         })
//     })
// }

function setDonationDetails(){
    document.getElementById("donate_name").value = user["name"];
    document.getElementById("donate_email").value = user["email"];
    if(user["addr"] != null){
        document.getElementById("donate_addr").value = user["addr"];
    }
    document.getElementById("donate_recv_addr").value = causes[1]["creator"];
    document.getElementById("donate_cause").value = causes[1]["descr"];
    document.getElementById("donate_amt").value = 0.25;
}

function setAmt(amt){
    document.getElementById("donate_amt").value = amt;
}

function selectPaymentType(){
    if(document.getElementById("crypto").checked){
        console.log("crypto")
        document.getElementById("crypto_subform").style.display = "block";
        document.getElementById("card_subform").style.display = "none";
        document.getElementById("net_subform").style.display = "none";

    }
    else if(document.getElementById("credit_card").checked){
        console.log("card")
        document.getElementById("crypto_subform").style.display = "none";
        document.getElementById("card_subform").style.display = "block";
        document.getElementById("net_subform").style.display = "none";
    }
    else if(document.getElementById("net_banking").checked){
        console.log("net banking")
        document.getElementById("crypto_subform").style.display = "none";
        document.getElementById("card_subform").style.display = "none";
        document.getElementById("net_subform").style.display = "block";
    }
}

function loadUser(){
    user = JSON.parse(window.localStorage.getItem('user'));
    console.log(user);
    if(user == null){
        document.getElementById("login_btn").style.display = "block";
        document.getElementById("logout_btn").style.display = "none";
        document.getElementById("profile_btn").style.display = "none";
        document.getElementById("user_info").innerHTML = "Not Logged In";

        disableButtons();
    }
    else{
        document.getElementById("login_btn").style.display = "none";
        document.getElementById("logout_btn").style.display = "block";
        document.getElementById("profile_btn").style.display = "block";
        document.getElementById("user_info").innerHTML = "Loading...";
        getBal(user["addr"])
    }
}

function disableButtons(){
    let btns = document.getElementsByClassName("btn-after-login");
    for (let i = 0; i < btns.length; i++){
        btns[i].disabled = true;
    }
    console.log("reached here")
    document.getElementById("crypto_warn").style.display = "block";
    document.getElementById("donate_card_warn").style.display = "block";
    document.getElementById("kind_warn").style.display = "block";
}

function logout(){
    console.log("Logout");
    window.localStorage.removeItem("user");
    location.reload();
}

function getExchangeRate(){
    doCall("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD", (res) => {
        console.log(res);
        x = document.getElementsByClassName("exchange");
        for(let i = 0; i < x.length; i++){
            x[i].innerHTML = `<span><i>1 ETH = USD ${JSON.parse(res)["USD"]}</i></span>`
        }
    })
}

function showInCashForm(){
    console.log("cash");
    document.getElementById("donation_type").innerHTML = 
    `
    <a class="btn gradient-bg mr-2" onCLick="showInCashForm()">Cash</a>
    <a class="btn orange-border" onClick="showInKindForm()">Kind</a>
    `
    document.getElementById("cash_form").style.display = "block";
    document.getElementById("kind_form").style.display = "none";
}

function showInKindForm(){
    console.log("kind");
    document.getElementById("donation_type").innerHTML = 
    `
    <a class="btn orange-border" onCLick="showInCashForm()">Cash</a>
    <a class="btn gradient-bg mr-2" onClick="showInKindForm()">Kind</a>
    `
    document.getElementById("cash_form").style.display = "none";
    document.getElementById("kind_form").style.display = "block";
}


function donateInKind(){
    name = document.getElementById("kind_donate_name").value;
    email = document.getElementById("kind_donate_email").value;
    loc = document.getElementById("kind_donate_loc").value.replace(/ /g, "+");
    console.log(loc);
    type = document.getElementById("kind_donate_type").value;
    particular = document.getElementById("kind_donate_particular").value;
    qty = document.getElementById("kind_donate_qty").value;

    if(name == "" || email == "" || loc == "" || type == "Type of Donation:" || particular == "" || qty == ""){
        document.getElementById("kind_err").innerHTML = "Field can't remain empty";
        document.getElementById("kind_err").style.display = "block";
        return;
    }

    firebase.database().ref(`donations/${type}`).push({
        name: name,
        email: email,
        location: loc,
        particular: particular,
        qty: qty
    });
    document.getElementById("donation_kind_success").style.display = "block";
}

function retrieveDonations(){
    let types = ["Groceries", "Sanitation", "Others"];
    for(i =0; i < types.length; i++){
        console.log(i);
        let type = types[i];
        let database = firebase.database().ref('donations/' + type);

        database.on('value', function(snapshot){
            document.getElementById("loading_donations").style.display = "none";
            snapshot.forEach(snap => {
                console.log(snap.val())
                document.getElementById(`donations_table_body`).innerHTML += 
                    `<tr value=${snap.key}>
                        <td>${type}</th>
                        <td>${snap.val()["particular"]}</td>
                        <td>${snap.val()["qty"]}</td>
                        <td><a target="_blank" href="https://www.google.com/maps/search/${snap.val()["location"]}"><button class="gradient-bg-button">View</button></a></td>
                    </tr>
                    `
                requests[snap.key] = {
                    "name": snap.val()["name"],
                    "addr": snap.val()["res_addr"],
                    "descr": snap.val()["descr"],
                    "status": snap.val()["status"],
                    "type": type
                }
            })
        })
    }
}

function loadFunc(){
    loadUser();
    getExchangeRate();
    retrieveDonations();
    retrieveCauses();
}
