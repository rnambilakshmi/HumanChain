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

