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