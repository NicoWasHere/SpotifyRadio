if(window.location.pathname=="/login" || window.location.pathname=="/create-account"){

    if(document.cookie && document.cookie.split('; ').find(row => row.startsWith('token')).split('=')[1] ){
        console.log("pl")
        window.location = "/account"
    }
}
else if(!document.cookie || !document.cookie.split('; ').find(row => row.startsWith('token')).split('=')[1]){
    window.location = "/login"
}
else if(window.location.pathname!="/account"){
fetch("/account/data",{
    method: "POST",
}).then((response)=>{
    if(response.status == 409){
      window.location = "/account"
    }
})
}