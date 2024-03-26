console.log("Let's write Javascript");
let currentSong = new Audio();
let songs = [];
let songsNames = [];
let artistsNames = [];

function secondsToMMSS(seconds) {
  // Get minutes and seconds
  var minutes = Math.floor(seconds / 60);
  var remainingSeconds = Math.round(seconds % 60); // Round off seconds

  // Add leading zero if seconds or minutes are less than 10
  var minutesString = minutes < 10 ? "0" + minutes : minutes;
  var secondsString =
    remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

  // Concatenate minutes and seconds with ':'
  return minutesString + ":" + secondsString;
}
async function getSongs(folder) {
  let a = await fetch(`/client/${folder}/`);
  let response = await a.text();
  // console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  songsNames = [];
  artistsNames = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    let newHref = element.href.split("/");
    let finalHref = `/client/${folder}/` + newHref[4];
    if (element.href.endsWith(".mp3")) {
      songs.push(finalHref);
      songsNames.push(newHref[4].replaceAll("%20", " "));
      artistsNames.push(
        newHref[4].replaceAll("%20", " ").split("-")[1].replace(".mp3", "")
      );
    }
  }
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  let i = 0;
  for (const song of songsNames) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
    <img class="invert" src="img/music.svg" alt="" />
    <div class="info">
      <div>${songsNames[i]}</div>
      <div>${artistsNames[i]}</div>
    </div>
    <div class="playnow">Play Now</div>
    <img src="img/play.svg" class="invert" />
  </li>`;
    i++;
  }
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      let index = songsNames.indexOf(
        e.querySelector(".info").firstElementChild.innerHTML
      );
      playMusic(songs[index], songsNames[index]);
    });
  });
}

const playMusic = (track, trackName) => {
  currentSong.src = track;
  currentSong.play();
  play.src = "img/pause.svg";
  document.querySelector(".songinfo").innerHTML = trackName;
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch("/client/songs/");
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  console.log(array.length);
  for (let index = 0; index < array.length; index++) {
    console.log(array[index]);
    const e = array[index];
    let folder = e.href.split("/")[4];
    if (
      folder !== ".DS_Store" &&
      folder !== ".htaccess" &&
      folder !== "http-server" &&
      folder !== undefined
    ) {
      console.log(folder);
      let a = await fetch(`/client/songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `            <div class="card" data-folder="${folder}">
      <div class="play">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="MS 20V4L19 12L5 20Z"
            stroke="#141B34"
            fill="#000"
            stroke-width="1.5"
            stroke-linejoin="round"
          ></path>
        </svg>
      </div>
      <img src="songs/${folder}/cover.jpg" alt="" />
      <h2>${response.title}</h2>
      <p>${response.description}</p>
    </div>`;
    }
  }
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = [];
      await getSongs(`songs/${item.currentTarget.dataset.folder}`);
    });
  });
}

async function main() {
  await getSongs("songs/ncs");

  displayAlbums();

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMMSS(
      currentSong.currentTime
    )} / ${secondsToMMSS(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  previous.addEventListener("click", () => {
    let currentIndex = songs.indexOf(currentSong.src);
    let newIndex = -1;
    if (currentSong.currentTime > 3) {
      playMusic(songs[currentIndex], songsNames[currentIndex]);
    } else {
      if (currentIndex === 0) {
        newIndex = songs.length - 1;
      } else {
        newIndex = currentIndex - 1;
      }
      playMusic(songs[newIndex], songsNames[newIndex]);
    }
  });

  next.addEventListener("click", () => {
    let currentIndex = songs.indexOf(currentSong.src);
    let newIndex = -1;

    if (currentIndex === songs.length) {
      newIndex = 0;
    } else {
      newIndex = currentIndex + 1;
    }

    playMusic(songs[newIndex], songsNames[newIndex]);
  });

  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
    });
}

main();
