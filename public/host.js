
//js for a host to publish their spotify
const songInfo = document.querySelector("#rightBody")
const disconnectInfo = songInfo.innerHTML
const streamButton = document.querySelector("button")
const title = document.querySelector("#title")
const token = document.cookie.split('; ').find(row => row.startsWith('token')).split('=')[1];
let user = ""
let streaming = false
let socket = null

//event for webSDK
window.onSpotifyWebPlaybackSDKReady = () => {
    //gets the current accounts data
    fetch("/account/data",{
        method: "POST",
    }).then((response)=>{
        if(response.status == 200){
            return response.json()
        }
    //uses the data to create a web player
    }).then((data) => {
    user = data.username
    title.innerHTML = user+"'s Radio"
    const link = document.querySelector("#radioLink").innerText = window.location.origin+"/"+data.username
    streamButton.onclick = () => toggleStream(data.username)
    let spotify_token = data.spotify_token;
    //contr
    const player = new Spotify.Player({
      name: 'Spotify Radio',
      getOAuthToken: cb => { cb(spotify_token); }
    });
    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { 
        //likely token is expired so it refreshes it
        console.error(message);
        if(message){
        fetch("/refresh",{
            method:"POST"
        }).then((res)=>{
            console.log(res)
            if(res.status == 200){
            return res.text()
        }
        }).then(data=>
            spotify_token = data
        )
        window.location.reload();
    }
     });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });
  
    //listening for updates
    player.addListener('player_state_changed', state => { 
        if(state != null){
        const currentSong = state.track_window.current_track
        songInfo.innerHTML = `<h1>Currently Playing</h1><img src = ${currentSong.album.images[0].url}><h1>${currentSong.name}</h1><h2>${currentSong.artists[0].name}</h2>`
        //pushes the updates to the server
        if(streaming){
        socket.emit('update', {
            token: token,
            data:{
                radioTitle: title.innerHTML,
                position: state.position,
                paused: state.paused,
                song: currentSong
            }
        });
    }
        }
        //is the person doesn't have the radio device set
        else{
            songInfo.innerHTML = disconnectInfo
        }
    });
    player.connect();
})
  };

//creates and destroys the websocket
const toggleStream = (username) =>{
      streaming = !streaming
      if(streaming){
        socket = io.connect(window.location.origin+"/"+username)
        fetch("/start-stream",{
            method: "POST"
        })
        socket.on('listenerCount',(count)=>{
            document.querySelector("#listenerCount p").innerText = count + " listeners"
        })
        streamButton.innerText = "Stop Radio"
      }
      else{
        socket.disconnect()
        fetch("/stop-stream",{
            method: "POST"
        })
        streamButton.innerText = "Start Radio"
      }
  }
  
//controls the title
document.querySelector("#titleContainer").addEventListener("click",()=>title.focus())
document.querySelector('#title').addEventListener('keydown', (evt) => {
    if (evt.keyCode === 13) {
        title.blur();
    }
});
title.addEventListener("blur",()=>{
    if(title.innerHTML.length==0){
        title.innerHTML = user+"'s Radio"
    }

    fetch("/update-title",{
        method: "POST",
        body: JSON.stringify({title:title.innerHTML}),
        headers: {
        'Content-Type': 'application/json'
        },
    }
    )
})
