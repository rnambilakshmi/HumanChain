// url = "http://newsapi.org/v2/top-headlines?apiKey=fbec877d7ee8445f80fa3b4662a09692&category=health&q=covid";


news_url = 'https://newsapi.org/v2/top-headlines?q=COVID&from=2020-03-16&sortBy=publishedAt&apiKey=fbec877d7ee8445f80fa3b4662a09692&pageSize=50&page=1'

stats_url = "https://corona.lmao.ninja/countries?sort=cases"

function getLastUpdated(strDate){
    var datum = Date.parse(strDate);
    dateObj = new Date(datum);

    today=new Date()

    dif = today.getTime() - dateObj.getTime();
    min = Math.ceil(dif/(1000*60));
    hr = Math.ceil(dif/(1000*60*60));

    if(min >= 60){
        return String(hr) + " hours ago";
    }
    else if (min < 60 && min > 0){
        return String(min) + " minutes ago";
    }
    else{
        return "Recently";
    }
}

function doCall(url, callback){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.send(null);
}

function getNews(){
    doCall(news_url, (res) => {
        document.getElementById("load_news").style.display = "none";
        // console.log(res)
        res = JSON.parse(res);
        let news_cards = document.getElementById("news_cards")
        console.log(res["totalResults"]);
        for(let i = 0; i < Math.min(50, res["totalResults"]); i++){
            article = res["articles"][i];
            let lastUpdated
            try{
                lastUpdated = getLastUpdated(article["publishedAt"]);
            }
            catch{
                lastUpdated = "Some time ago"
            }
            console.log("reached here!");
            
            news_cards.innerHTML += 
            `
            <div class="col-6 col-lg-6">
                <a style="text-decoration: none;" target="_blank" class="news_card" href=${article["url"]}>
                    <div class="card">
                        <img class="card-img-top" src=${article["urlToImage"]} alt=${article["title"]}>
                        <div class="card-body">
                            <h5 class="card-title">${article["title"]}</h5>
                            <p class="card-text">${article["description"]}</p>
                        </div>
                        <div class="card-footer">
                            <small class="text-muted"><b>News by:</b> ${article["source"]["name"]}</small>
                            <br />
                            <small class="text-muted"><b>Last updated:</b> ${lastUpdated}</small>
                        </div>
                    </div>
                </a>
            </div>
            `
        }
    })
}

getNews()


function getCountryStats(){
    doCall(stats_url, (res) => {
        document.getElementById("load_stats").style.display = "none";

        console.log(res);
        
        res = JSON.parse(res);
        console.log(res.length);
        let stats_table = document.getElementById("stats_table_body")
        
        for(let i = 0; i < res.length; i++){

            stats_table.innerHTML += 
            `
            <tr>
                <th scope="row">${res[i]["country"]}</th>
                <td>${res[i]["cases"]}</td>
                <td>${res[i]["deaths"]}</td>
                <td>${res[i]["recovered"]}</td>
            </tr>
            `
        }

        

    })
}

getCountryStats()



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