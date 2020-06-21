//js code for the listening side
const radioName = window.location.pathname.split('/')[1] + "'s Radio"
const radioTitle = document.querySelector("#radioTitle")
const reconnectInfo = document.querySelector("#songInfo").innerHTML

//updating page display
window.onload = () =>{
  document.querySelector("title").innerText = radioName;
  document.querySelector("#host").innerText += " "+ window.location.pathname.split('/')[1];
  document.querySelectorAll(".connectInstruc").forEach(instance=>{instance.innerText+=" "+radioName})
}

//joins the socket for the page
const socket = io.connect(window.location.href)

//webSDK event
window.onSpotifyWebPlaybackSDKReady = () => {
  let device = null
  let stored_id = null
  let currentSong = {}
  //getting data
  fetch("/account/data",{
    method: "POST",
}).then((response)=>{
    if(response.status == 200){
        return response.json()
    }
}).then((data) => {
      //creating web player
      const spotify_token = data.spotify_token;
      const player = new Spotify.Player({
        name: radioName,
        getOAuthToken: cb => { cb(spotify_token); }
      });
      
      //Error handling
      player.addListener('initialization_error', ({ message }) => { console.error(message); });
      player.addListener('authentication_error', ({ message }) => { 
        //refreshing token
        console.error(message);
        if(message){
        fetch("/refresh",{
            method:"POST"
        })
        window.location.reload();
    }});
      player.addListener('account_error', ({ message }) => { console.error(message); });
      player.addListener('playback_error', ({ message }) => { console.error(message); });
      
      //joining the radio by switching devices
      player.addListener('ready', ({ device_id }) => {
        stored_id = device_id
        if(currentSong.song){
        updateSong(currentSong)
      }
      });

      //user tries to updatre radio
      player.addListener('player_state_changed', state=>{
        if (state == null){
          device = null
          document.querySelector("#songInfo").innerHTML = reconnectInfo
        }
        else if (device == null){
          device = stored_id
          fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device}`,{
            method: "PUT",
            body: JSON.stringify({
              uris: [currentSong.song.uri],
              position_ms: currentSong.position
            }),
            headers:{
              'Content-Type': 'application/json',
              'Authorization': "Bearer "+spotify_token
            }
          })
          document.querySelector("#songInfo").innerHTML = `<img src = ${currentSong.song.album.images[0].url}><div><p>${currentSong.song.name}</p><p>${currentSong.song.artists[0].name}</p></div>`
      }})

      // Connect to the player!
      player.connect();

      //updating the current song
      const updateSong = (song) =>{
        radioTitle.innerHTML = song.radioTitle
        //if song is different
        if(device != null){
        if((!currentSong.song || currentSong.song.uri!=song.song.uri)){
          currentSong.song = song.song
          fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device}`,{
            method: "PUT",
            body: JSON.stringify({
              uris: [song.song.uri],
              position_ms: 0
            }),
            headers:{
              'Content-Type': 'application/json',
              'Authorization': "Bearer "+spotify_token
            }
          })
          updateSong(currentSong)
        }
        //if just position is different
        else if(currentSong.position!=song.position){
          currentSong.position = song.position
          player.seek(song.position)
        }
        //if song is paused
        if(currentSong.paused!=song.paused){
          currentSong.paused = song.paused
          if(song.paused){
            player.pause()
            document.querySelector("#pause").src = "static/Pause.png"
          }
          else{
            player.resume()
            document.querySelector("#pause").src = "static/Play.png"
          }
        }
        //display
        document.querySelector("#songInfo").innerHTML = `<img src = ${currentSong.song.album.images[0].url}><div><p>${currentSong.song.name}</p><p>${currentSong.song.artists[0].name}</p></div>`
      }
      else{
        currentSong = song
      }
    }

      //listens for the socket
      socket.on('command', (msg)=>{
        updateSong(msg)
      });
    })
    };

    