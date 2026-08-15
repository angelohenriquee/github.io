const CONFIG = {
  password: "novoeditorial",

  whatsappNumber: "55SEUNUMERO",

  whatsappMessage:
    "Olá, Ângelo. Vi a experiência e gostaria de conversar sobre ela."
};


const scenes = [...document.querySelectorAll(".scene")];
const videos = scenes.map(scene => scene.querySelector("video"));

const navigation = document.querySelector(".navigation");
const backButton = document.getElementById("backButton");
const nextButton = document.getElementById("nextButton");

const passwordInput = document.getElementById("password");
const enterButton = document.getElementById("enterButton");
const loginPanel = document.querySelector(".login-panel");
const passwordError = document.getElementById("passwordError");

let currentScene = 0;
let unlocked = false;

const BUTTON_DELAY = 750;
const TRANSITION_TIME = 900;


/* =========================
   NAVEGAÇÃO
========================= */

function hideNavigation() {
  navigation.classList.remove("visible");

  backButton.hidden = true;
  nextButton.hidden = true;
}


function showNavigation() {
  window.setTimeout(() => {

    if (!unlocked) return;

    navigation.classList.add("visible");

    if (currentScene === 1) {
      backButton.hidden = true;
    } else {
      backButton.hidden = false;
    }

    if (currentScene === scenes.length - 1) {
      nextButton.textContent = "Quero essa experiência";
    } else {
      nextButton.textContent = "Avançar";
    }

    nextButton.hidden = false;

  }, BUTTON_DELAY);
}


/* =========================
   VÍDEOS
========================= */

function resetVideo(video) {

  if (!video) return;

  video.pause();
  video.currentTime = 0;
}


function playScene(index) {

  const video = videos[index];

  if (!video) {
    showNavigation();
    return;
  }

  resetVideo(video);

  /*
    Depois que a pessoa interage com a senha,
    tentamos reproduzir o vídeo com áudio.
  */

  video.muted = false;

  const playPromise = video.play();

  if (playPromise) {

    playPromise.catch(() => {

      /*
        Caso o navegador bloqueie o áudio,
        o vídeo permanece disponível.
      */

    });

  }


  /*
    Quando o vídeo termina,
    ele permanece parado no último frame.
  */

  video.onended = () => {

    showNavigation();

  };
}


/* =========================
   PRÉ-CARREGAR PRÓXIMO VÍDEO
========================= */

function preloadNext(index) {

  const nextIndex = index + 1;

  if (nextIndex >= videos.length) {
    return;
  }

  const nextVideo = videos[nextIndex];

  if (!nextVideo) {
    return;
  }

  nextVideo.preload = "auto";
  nextVideo.load();
}


/* =========================
   TROCA DE CENA
========================= */

function goToScene(index) {

  if (index < 1 || index >= scenes.length) {
    return;
  }

  hideNavigation();

  const previousScene = scenes[currentScene];
  const nextScene = scenes[index];


  /*
    A nova cena entra por dissolve.
  */

  nextScene.classList.add("active");


  window.setTimeout(() => {

    previousScene.classList.remove("active");

  }, TRANSITION_TIME);


  /*
    Para o vídeo anterior.
  */

  resetVideo(videos[currentScene]);


  currentScene = index;


  /*
    Toda cena começa novamente do início.
    Isso também acontece ao voltar.
  */

  playScene(currentScene);


  /*
    Pré-carrega a próxima cena.
  */

  preloadNext(currentScene);
}


/* =========================
   LOGIN
========================= */

function unlockExperience() {

  const enteredPassword = passwordInput.value;


  if (enteredPassword !== CONFIG.password) {

    passwordError.classList.add("visible");

    passwordInput.focus();

    return;
  }


  passwordError.classList.remove("visible");

  unlocked = true;


  /*
    Esconde senha e botão Entrar.
  */

  loginPanel.classList.add("hidden");


  /*
    Dissolve da logo para a primeira cena
    da experiência.
  */

  window.setTimeout(() => {

    scenes[0].classList.remove("active");

    goToScene(1);

  }, 350);
}


/* =========================
   BOTÃO ENTRAR
========================= */

enterButton.addEventListener("click", unlockExperience);


passwordInput.addEventListener("keydown", event => {

  if (event.key === "Enter") {

    unlockExperience();

  }

});


passwordInput.addEventListener("input", () => {

  passwordError.classList.remove("visible");

});


/* =========================
   BOTÃO VOLTAR
========================= */

backButton.addEventListener("click", () => {

  if (currentScene <= 1) {
    return;
  }

  goToScene(currentScene - 1);

});


/* =========================
   BOTÃO AVANÇAR
========================= */

nextButton.addEventListener("click", () => {


  /*
    Na última tela,
    abre o WhatsApp.
  */

  if (currentScene === scenes.length - 1) {

    const phone =
      CONFIG.whatsappNumber.replace(/\D/g, "");

    const message =
      encodeURIComponent(CONFIG.whatsappMessage);


    window.location.href =
      `https://wa.me/${phone}?text=${message}`;

    return;
  }


  goToScene(currentScene + 1);

});


/* =========================
   VÍDEO DA LOGO
========================= */

const loginVideo = videos[0];


if (loginVideo) {

  loginVideo.addEventListener(
    "canplaythrough",
    () => {

      loginVideo.play().catch(() => {});

    },
    { once: true }
  );

}


/* =========================
   PRÉ-CARREGAMENTO INICIAL
========================= */

window.addEventListener("load", () => {

  if (videos[1]) {

    videos[1].preload = "auto";

    videos[1].load();

  }

});
