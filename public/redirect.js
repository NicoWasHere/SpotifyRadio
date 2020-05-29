if(!document.cookie || !document.cookie.split('; ').find(row => row.startsWith('token')).split('=')[1]){
    window.location = "/login"
}
else{
fetch("/account/data",{
    method: "POST",
}).then((response)=>{
    if(response.status == 409){
      window.location = "/account"
    }
})
}