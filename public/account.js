const spotifyButton = document.querySelector("#connect-spotify")

//redirects through the spotify auth system
spotifyButton.onclick = () =>{
    window.location = "/spotify/connect"
}

//gets the account data 
fetch("/account/data",{
    method: "POST",
}).then((response)=>{
    if(response.status == 200){
        return response.json()
    }
}).then((data) => {
    if(data){
        //gets rid of the connect button
        document.querySelector("[name = username]").value = data.username
        document.querySelector("[name = email]").value = data.email
        document.querySelector("#connect-spotify").remove()
    }
    else{
        document.querySelector("form").remove()
    }
});


