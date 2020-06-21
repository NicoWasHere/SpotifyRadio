let logouts = document.getElementsByClassName("logout")
for (logout of logouts){
        logout.addEventListener('click',()=>{
            document.cookie+='token =; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        })
}