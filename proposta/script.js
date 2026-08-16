const CONFIG = {
  password: "novoeditorial",

  whatsappNumber: "55SEUNUMERO",

  whatsappMessage:
    "Olá, Ângelo. Vi a experiência e gostaria de conversar sobre ela."
};


/* =========================================================
   ELEMENTOS
========================================================= */

const scenes = [...document.querySelectorAll(".scene")];

const videos = scenes.map(scene =>
  scene.querySelector(".scene-video")
);

const navigation =
  document.getElementById("navigation");

const backButton =
  document.getElementById("backButton");

const nextButton =
  document.getElementById("nextButton");

const passwordInput =
  document.getElementById("password");

const enterButton =
  document.getElementById("enterButton");

const loginPanel =
  document.querySelector(".login-panel");

const passwordError =
  document.getElementById("passwordError");

const blackTransition =
  document.getElementById("blackTransition");


/* =========================================================
   ESTADO
========================================================= */

let currentScene = 0;

let unlocked = false;

let isHolding = false;

let holdPointerId = null;

let sceneFinished = false;

let blackTimer = null;

let navigationTimer = null;


/* =========================================================
   TEMPOS
========================================================= */

const BUTTON_DELAY = 700;

const TRANSITION_DURATION = 900;


/* =========================================================
   LIMPEZA
========================================================= */

function clearTimers() {

  window.clearTimeout(blackTimer);

  window.clearTimeout(navigationTimer);

}


/* =========================================================
   ESCONDER NAVEGAÇÃO
========================================================= */

function hideNavigation() {

  window.clearTimeout(navigationTimer);

  navigation.classList.remove("visible");

  backButton.hidden = true;

  nextButton.hidden = true;
}


/* =========================================================
   RESET DO FINAL
========================================================= */

function resetFinishingState(scene) {

  if (!scene) return;

  scene.classList.remove("finishing");

  const endFrame =
    scene.querySelector(".end-frame");

  if (endFrame) {

    endFrame.style.backgroundImage = "";

  }
}


/* =========================================================
   RESET DO VÍDEO
========================================================= */

function resetVideo(video) {

  if (!video) return;

  video.pause();

  try {

    video.currentTime = 0;

  } catch (error) {

    // Ignorar

  }

}


/* =========================================================
   ETIQUETAS DOS BOTÕES
========================================================= */

function updateNavigationLabels() {

  /*
    O botão Avançar precisa SEMPRE
    voltar a ficar disponível quando
    a navegação for mostrada.
  */

  nextButton.hidden = false;


  /*
    Na primeira tela da experiência,
    não existe botão Voltar.
  */

  if (currentScene === 1) {

    backButton.hidden = true;

  } else {

    backButton.hidden = false;

  }


  /*
    Última tela.
  */

  if (
    currentScene ===
    scenes.length - 1
  ) {

    nextButton.textContent =
      "Quero essa experiência";

  } else {

    nextButton.textContent =
      "Avançar";

  }

}


/* =========================================================
   MOSTRAR NAVEGAÇÃO
========================================================= */

function showNavigation() {

  window.clearTimeout(navigationTimer);

  navigationTimer = window.setTimeout(() => {

    if (!unlocked) return;

    updateNavigationLabels();

    navigation.classList.add(
      "visible"
    );

  }, BUTTON_DELAY);

}


/* =========================================================
   CAPTURAR ÚLTIMO FRAME
========================================================= */

function captureLastFrame(
  scene,
  video
) {

  if (!scene || !video) {
    return;
  }


  const endFrame =
    scene.querySelector(".end-frame");


  if (!endFrame) {
    return;
  }


  try {

    const videoWidth =
      video.videoWidth || 1080;

    const videoHeight =
      video.videoHeight || 1920;


    const canvas =
      document.createElement("canvas");


    canvas.width =
      videoWidth;

    canvas.height =
      videoHeight;


    const context =
      canvas.getContext("2d");


    context.drawImage(
      video,
      0,
      0,
      videoWidth,
      videoHeight
    );


    const frame =
      canvas.toDataURL(
        "image/jpeg",
        0.90
      );


    endFrame.style.backgroundImage =
      `url("${frame}")`;


    endFrame.style.backgroundSize =
      "cover";

    endFrame.style.backgroundPosition =
      "center";

    endFrame.style.backgroundRepeat =
      "no-repeat";


  } catch (error) {

    /*
      Mesmo se a captura falhar,
      o dissolve para preto continua.
    */

    endFrame.style.backgroundImage =
      "";

  }

}


/* =========================================================
   FINAL DA CENA
========================================================= */

function finishScene(index) {

  const scene =
    scenes[index];

  const video =
    videos[index];


  if (!scene || !video) {
    return;
  }


  if (sceneFinished) {
    return;
  }


  sceneFinished = true;


  /*
    Mantém o vídeo no último frame.
  */

  try {

    video.currentTime =
      video.duration;

  } catch (error) {

    // Ignorar

  }


  /*
    Captura o último frame.
  */

  captureLastFrame(
    scene,
    video
  );


  /*
    Começa o desfoque
    do último frame.
  */

  scene.classList.add(
    "finishing"
  );


  /*
    Depois começa a dissolução
    para preto.
  */

  blackTimer =
    window.setTimeout(() => {

      blackTransition.classList.add(
        "active"
      );

    }, 250);


  /*
    Depois do preto,
    libera os botões.
  */

  navigationTimer =
    window.setTimeout(() => {

      if (!unlocked) {
        return;
      }


      updateNavigationLabels();


      navigation.classList.add(
        "visible"
      );

    }, 850);

}


/* =========================================================
   REPRODUZIR CENA
========================================================= */

function playScene(index) {

  const scene =
    scenes[index];

  const video =
    videos[index];


  if (!scene || !video) {
    return;
  }


  sceneFinished = false;

  clearTimers();

  resetFinishingState(
    scene
  );

  blackTransition.classList.remove(
    "active"
  );

  hideNavigation();

  resetVideo(video);


  /*
    Login sem áudio.
  */

  if (index === 0) {

    video.muted = true;

  } else {

    video.muted = false;

  }


  /*
    Reprodução.
  */

  const playVideo = () => {

    const promise =
      video.play();


    if (promise) {

      promise.catch(() => {

        /*
          Fallback sem áudio
          caso o navegador bloqueie.
        */

        if (index !== 0) {

          video.muted = true;

          video.play().catch(() => {});

        }

      });

    }

  };


  if (video.readyState >= 3) {

    playVideo();

  } else {

    video.addEventListener(
      "canplay",
      playVideo,
      {
        once: true
      }
    );

  }


  /*
    Pressionar para pausar:
    somente telas 2–9.
  */

  if (index !== 0) {

    attachHoldPause(
      scene,
      video
    );

  }


  /*
    Final.
  */

  video.onended = () => {

    finishScene(index);

  };


  /*
    Pré-carrega a próxima tela.
  */

  preloadNext(index);

}


/* =========================================================
   PRÉ-CARREGAMENTO
========================================================= */

function preloadNext(index) {

  const nextIndex =
    index + 1;


  if (
    nextIndex >=
    videos.length
  ) {

    return;

  }


  const nextVideo =
    videos[nextIndex];


  if (!nextVideo) {
    return;
  }


  nextVideo.preload =
    "auto";


  try {

    nextVideo.load();

  } catch (error) {

    // Ignorar

  }

}


/* =========================================================
   PAUSAR
========================================================= */

function pauseVideo(video) {

  if (!video) {
    return;
  }


  if (
    !video.paused &&
    !video.ended
  ) {

    video.pause();

  }

}


/* =========================================================
   CONTINUAR
========================================================= */

function resumeVideo(video) {

  if (!video) {
    return;
  }


  if (video.ended) {
    return;
  }


  const promise =
    video.play();


  if (promise) {

    promise.catch(() => {});

  }

}


/* =========================================================
   SEGURAR PARA PAUSAR
========================================================= */

function attachHoldPause(
  scene,
  video
) {

  if (
    scene.dataset.holdBound ===
    "true"
  ) {

    return;

  }


  scene.dataset.holdBound =
    "true";


  scene.addEventListener(
    "pointerdown",
    event => {

      if (
        event.pointerType === "mouse" &&
        event.button !== 0
      ) {

        return;

      }


      if (
        event.target.closest(
          ".navigation"
        )
      ) {

        return;

      }


      if (
        sceneFinished ||
        video.ended
      ) {

        return;

      }


      isHolding = true;

      holdPointerId =
        event.pointerId;


      pauseVideo(video);

    },
    {
      passive: true
    }
  );


  scene.addEventListener(
    "pointerup",
    event => {

      if (
        holdPointerId !== null &&
        event.pointerId !==
          holdPointerId
      ) {

        return;

      }


      if (!isHolding) {
        return;
      }


      isHolding = false;

      holdPointerId = null;


      if (
        !sceneFinished &&
        !video.ended
      ) {

        resumeVideo(video);

      }

    },
    {
      passive: true
    }
  );


  scene.addEventListener(
    "pointercancel",
    event => {

      if (
        holdPointerId !== null &&
        event.pointerId !==
          holdPointerId
      ) {

        return;

      }


      isHolding = false;

      holdPointerId = null;


      if (
        !sceneFinished &&
        !video.ended
      ) {

        resumeVideo(video);

      }

    },
    {
      passive: true
    }
  );

}


/* =========================================================
   TROCAR CENA
========================================================= */

function goToScene(index) {

  if (
    index < 1 ||
    index >= scenes.length
  ) {

    return;

  }


  const previousScene =
    scenes[currentScene];

  const nextScene =
    scenes[index];

  const previousVideo =
    videos[currentScene];


  clearTimers();


  isHolding = false;

  holdPointerId = null;

  sceneFinished = false;


  hideNavigation();


  blackTransition.classList.remove(
    "active"
  );


  resetFinishingState(
    previousScene
  );


  nextScene.classList.add(
    "active"
  );


  window.setTimeout(() => {

    previousScene.classList.remove(
      "active"
    );

  }, TRANSITION_DURATION);


  if (previousVideo) {

    previousVideo.pause();


    try {

      previousVideo.currentTime =
        0;

    } catch (error) {

      // Ignorar

    }

  }


  currentScene =
    index;


  playScene(
    currentScene
  );

}


/* =========================================================
   LOGIN
========================================================= */

function unlockExperience() {

  const enteredPassword =
    passwordInput.value;


  if (
    enteredPassword !==
    CONFIG.password
  ) {

    passwordError.classList.add(
      "visible"
    );

    passwordInput.focus();

    return;

  }


  passwordError.classList.remove(
    "visible"
  );


  unlocked = true;


  loginPanel.classList.add(
    "hidden"
  );


  window.setTimeout(() => {

    scenes[0].classList.remove(
      "active"
    );


    goToScene(1);

  }, 350);

}


/* =========================================================
   BOTÃO ENTRAR
========================================================= */

enterButton.addEventListener(
  "click",
  unlockExperience
);


/* =========================================================
   ENTER NO CAMPO DE SENHA
========================================================= */

passwordInput.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter"
    ) {

      event.preventDefault();

      unlockExperience();

    }

  }
);


/* =========================================================
   LIMPAR ERRO
========================================================= */

passwordInput.addEventListener(
  "input",
  () => {

    passwordError.classList.remove(
      "visible"
    );

  }
);


/* =========================================================
   VOLTAR
========================================================= */

backButton.addEventListener(
  "click",
  event => {

    event.preventDefault();

    event.stopPropagation();


    if (
      currentScene <= 1
    ) {

      return;

    }


    goToScene(
      currentScene - 1
    );

  }
);


/* =========================================================
   AVANÇAR
========================================================= */

nextButton.addEventListener(
  "click",
  event => {

    event.preventDefault();

    event.stopPropagation();


    if (
      currentScene ===
      scenes.length - 1
    ) {

      const phone =
        CONFIG.whatsappNumber.replace(
          /\D/g,
          ""
        );


      const message =
        encodeURIComponent(
          CONFIG.whatsappMessage
        );


      if (!phone) {
        return;
      }


      window.location.href =
        `https://wa.me/${phone}?text=${message}`;


      return;

    }


    goToScene(
      currentScene + 1
    );

  }
);


/* =========================================================
   LOGIN
========================================================= */

const loginVideo =
  videos[0];


if (loginVideo) {

  loginVideo.muted = true;

  loginVideo.playsInline = true;


  loginVideo.setAttribute(
    "playsinline",
    ""
  );


  loginVideo.setAttribute(
    "webkit-playsinline",
    ""
  );


  loginVideo.addEventListener(
    "canplay",
    () => {

      loginVideo.play().catch(
        () => {}
      );

    },
    {
      once: true
    }
  );

}


/* =========================================================
   BLOQUEIO DE MENU DE CONTEXTO
========================================================= */

document.addEventListener(
  "contextmenu",
  event => {

    if (
      event.target.closest(
        ".scene"
      )
    ) {

      event.preventDefault();

    }

  }
);


/* =========================================================
   BLOQUEIO DE GESTOS DE ZOOM
========================================================= */

document.addEventListener(
  "gesturestart",
  event => {

    event.preventDefault();

  },
  {
    passive: false
  }
);


document.addEventListener(
  "gesturechange",
  event => {

    event.preventDefault();

  },
  {
    passive: false
  }
);


document.addEventListener(
  "gestureend",
  event => {

    event.preventDefault();

  },
  {
    passive: false
  }
);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

window.addEventListener(
  "load",
  () => {

    currentScene = 0;

    unlocked = false;

    sceneFinished = false;


    hideNavigation();


    blackTransition.classList.remove(
      "active"
    );


    scenes.forEach(scene => {

      if (
        scene.dataset.scene !== "0"
      ) {

        scene.classList.remove(
          "active"
        );

      }

    });


    scenes[0].classList.add(
      "active"
    );


    if (videos[1]) {

      videos[1].preload =
        "auto";


      try {

        videos[1].load();

      } catch (error) {

        // Ignorar

      }

    }

  }
);
