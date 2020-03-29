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
<b>Ethereum Address: &nbsp;</b> ${addr}
<b>Balance: &nbsp;</b> ${(bal/ 1000000000000000000).toFixed(2)} ETH
            </pre>
            `
            
        })
    }
    
}

function login(){
    document.getElementById("login_err").style.display = "none";
    document.getElementById("login_spin").style.display = "block";
    let email = document.getElementById("login_email").value;
    let psswd = document.getElementById("login_psswd").value;
    let found = false;
    let database = firebase.database().ref('users');
    database.on('value', function(snapshot){
        snapshot.forEach(snap => {
            if(snap.val().email == email) {
                console.log("Reached here")
                found = true;
                if(snap.val().psswd == psswd) {
                    user = snap.val()
                    console.log(user)
                    window.localStorage.setItem("user", JSON.stringify(user))
                    document.getElementById("login_spin").style.display = "block";
                    window.location.replace("./index.html");
                }
                else{
                    document.getElementById("login_spin").style.display = "none";
                    document.getElementById("login_err").innerHTML = "Invalid email ID or password. Please try again";
                    document.getElementById("login_err").style.display = "block";
                }
            }
        })

        if (found == false){
            document.getElementById("login_spin").style.display = "none";
            document.getElementById("login_err").innerHTML = "Email ID not registered. Please register first.";
            document.getElementById("login_err").style.display = "block";
        }
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