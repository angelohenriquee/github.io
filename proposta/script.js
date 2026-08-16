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

let finishingTimer = null;

let blackTimer = null;

let navigationTimer = null;


/* =========================================================
   TEMPOS
========================================================= */

const BUTTON_DELAY = 700;

const FINISH_DURATION = 850;

const BLACK_DURATION = 900;

const TRANSITION_DURATION = 900;


/* =========================================================
   UTILITÁRIOS
========================================================= */

function clearTimers() {

  window.clearTimeout(finishingTimer);
  window.clearTimeout(blackTimer);
  window.clearTimeout(navigationTimer);

}


function hideNavigation() {

  window.clearTimeout(navigationTimer);

  navigation.classList.remove("visible");

  backButton.hidden = true;

  nextButton.hidden = true;
}


function resetFinishingState(scene) {

  if (!scene) return;

  scene.classList.remove("finishing");

  const endFrame =
    scene.querySelector(".end-frame");

  if (endFrame) {

    endFrame.style.backgroundImage = "";

    endFrame.style.opacity = "";

  }
}


function resetVideo(video) {

  if (!video) return;

  video.pause();

  try {
    video.currentTime = 0;
  } catch (error) {
    // Alguns navegadores podem bloquear currentTime
    // enquanto o vídeo ainda não foi carregado.
  }
}


/* =========================================================
   ENQUADRAMENTO
========================================================= */

function forceVideoPosition(video) {

  if (!video) return;

  video.style.position = "absolute";

}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function updateNavigationLabels() {

  if (currentScene === 1) {

    backButton.hidden = true;

  } else {

    backButton.hidden = false;

  }


  if (currentScene === scenes.length - 1) {

    nextButton.textContent =
      "Quero essa experiência";

  } else {

    nextButton.textContent =
      "Avançar";

  }

}


function showNavigation() {

  clearTimeout(navigationTimer);

  navigationTimer = window.setTimeout(() => {

    if (!unlocked) return;

    updateNavigationLabels();

    navigation.classList.add("visible");

  }, BUTTON_DELAY);
}


/* =========================================================
   CAPTURA DO ÚLTIMO FRAME
========================================================= */

function captureLastFrame(scene, video) {

  if (!scene || !video) {
    return;
  }

  const endFrame =
    scene.querySelector(".end-frame");

  if (!endFrame) {
    return;
  }

  /*
    O vídeo já chegou ao fim.
    Tentamos capturar exatamente o quadro final
    em um canvas invisível.
  */

  try {

    const videoWidth =
      video.videoWidth || 1080;

    const videoHeight =
      video.videoHeight || 1920;

    const canvas =
      document.createElement("canvas");

    canvas.width = videoWidth;

    canvas.height = videoHeight;

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
      canvas.toDataURL("image/jpeg", 0.90);

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
      Se o navegador impedir a captura,
      a camada preta ainda fará a transição.
    */

    endFrame.style.backgroundImage = "";

  }

}


/* =========================================================
   FINAL DO VÍDEO
========================================================= */

function finishScene(index) {

  const scene = scenes[index];

  const video = videos[index];

  if (!scene || !video) {
    return;
  }

  if (sceneFinished) {
    return;
  }

  sceneFinished = true;

  /*
    Mantém o vídeo exatamente no último frame.
  */

  try {
    video.currentTime = video.duration;
  } catch (error) {
    // Ignorar
  }


  /*
    Captura o quadro final antes da camada
    começar a desfocar.
  */

  captureLastFrame(scene, video);


  /*
    Começa:
    último frame → blur → preto.
  */

  scene.classList.add("finishing");


  /*
    Depois da primeira parte do dissolve,
    entra a camada preta.
  */

  blackTimer = window.setTimeout(() => {

    blackTransition.classList.add("active");

  }, 250);


  /*
    Quando a transição estiver praticamente preta,
    aparecem os botões.
  */

  navigationTimer = window.setTimeout(() => {

    if (!unlocked) return;

    updateNavigationLabels();

    navigation.classList.add("visible");

  }, FINISH_DURATION);


  /*
    Mantemos a tela preta enquanto a pessoa
    aguarda a próxima interação.
  */

}


/* =========================================================
   REPRODUÇÃO
========================================================= */

function playScene(index) {

  const scene = scenes[index];

  const video = videos[index];

  if (!scene || !video) {
    return;
  }

  sceneFinished = false;

  clearTimeout(finishingTimer);
  clearTimeout(blackTimer);
  clearTimeout(navigationTimer);

  resetFinishingState(scene);

  blackTransition.classList.remove("active");

  hideNavigation();


  forceVideoPosition(video);

  resetVideo(video);


  /*
    A tela de login fica sempre sem áudio.
  */

  if (index === 0) {

    video.muted = true;

  } else {

    /*
      Depois do clique em Entrar,
      tentamos reproduzir com áudio.
    */

    video.muted = false;

  }


  /*
    Quando o navegador já tiver dados suficientes,
    reproduz o vídeo.
  */

  const playVideo = () => {

    const promise = video.play();

    if (promise) {

      promise.catch(() => {

        /*
          Em caso de bloqueio de áudio,
          tentamos uma segunda vez sem áudio.
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
      { once: true }
    );

  }


  /*
    O login não usa o comportamento de
    "segurar para pausar".
  */

  if (index !== 0) {

    attachHoldPause(scene, video);

  }


  /*
    Quando o vídeo termina:
    capturamos o último frame,
    aplicamos blur,
    dissolvemos para preto
    e mostramos os botões.
  */

  video.onended = () => {

    finishScene(index);

  };


  /*
    Pré-carrega a próxima cena.
  */

  preloadNext(index);

}


/* =========================================================
   PRÉ-CARREGAMENTO
========================================================= */

function preloadNext(index) {

  const nextIndex = index + 1;

  if (nextIndex >= videos.length) {
    return;
  }

  const nextVideo =
    videos[nextIndex];

  if (!nextVideo) {
    return;
  }

  nextVideo.preload = "auto";

  try {
    nextVideo.load();
  } catch (error) {
    // Ignorar
  }

}


/* =========================================================
   SEGURAR = PAUSAR
========================================================= */

function pauseVideo(video) {

  if (!video) return;

  if (!video.paused && !video.ended) {

    video.pause();

  }

}


function resumeVideo(video) {

  if (!video) return;

  if (video.ended) {
    return;
  }

  const promise =
    video.play();

  if (promise) {

    promise.catch(() => {});

  }

}


function attachHoldPause(scene, video) {

  /*
    Evita registrar o mesmo conjunto
    de eventos repetidas vezes.
  */

  if (scene.dataset.holdBound === "true") {
    return;
  }

  scene.dataset.holdBound = "true";


  /*
    TOUCH / POINTER
  */

  scene.addEventListener(
    "pointerdown",
    event => {

      /*
        Só reagimos ao ponteiro principal.
      */

      if (
        event.pointerType === "mouse" &&
        event.button !== 0
      ) {
        return;
      }


      /*
        Se o usuário estiver pressionando um
        elemento de navegação, não pausamos o vídeo.
      */

      if (
        event.target.closest(".navigation") ||
        event.target.closest(".login-panel")
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
        event.pointerId !== holdPointerId
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
        event.pointerId !== holdPointerId
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


  scene.addEventListener(
    "pointerleave",
    event => {

      /*
        No mouse, sair da área encerra
        o comportamento de pressão.
      */

      if (
        event.pointerType !== "mouse"
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

}


/* =========================================================
   TROCA DE CENA
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

  blackTransition.classList.remove("active");


  /*
    Remove o estado visual da cena anterior.
  */

  resetFinishingState(previousScene);


  /*
    Ativa a nova cena.
  */

  nextScene.classList.add("active");


  /*
    Dissolve da cena anterior.
  */

  window.setTimeout(() => {

    previousScene.classList.remove("active");

  }, TRANSITION_DURATION);


  /*
    Para o vídeo anterior.
  */

  if (previousVideo) {

    previousVideo.pause();

    try {
      previousVideo.currentTime = 0;
    } catch (error) {
      // Ignorar
    }

  }


  currentScene = index;


  /*
    Começa a nova cena do primeiro frame.
  */

  playScene(currentScene);

}


/* =========================================================
   LOGIN
========================================================= */

function unlockExperience() {

  const enteredPassword =
    passwordInput.value;


  if (
    enteredPassword !== CONFIG.password
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


  /*
    Esconde o login.
  */

  loginPanel.classList.add(
    "hidden"
  );


  /*
    Pequena pausa para a transição
    parecer parte da experiência.
  */

  window.setTimeout(() => {

    scenes[0].classList.remove(
      "active"
    );


    goToScene(1);

  }, 350);

}


/* =========================================================
   LOGIN — BOTÃO
========================================================= */

enterButton.addEventListener(
  "click",
  unlockExperience
);


/* =========================================================
   LOGIN — ENTER
========================================================= */

passwordInput.addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {

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


    if (currentScene <= 1) {
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


    /*
      Última tela:
      abre WhatsApp.
    */

    if (
      currentScene ===
      scenes.length - 1
    ) {

      const phone =
        CONFIG.whatsappNumber
          .replace(/\D/g, "");


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
   LOGIN — INICIALIZAÇÃO
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

      loginVideo.play().catch(() => {});

    },
    {
      once: true
    }
  );

}


/* =========================================================
   BLOQUEIOS EXTRAS
========================================================= */

document.addEventListener(
  "contextmenu",
  event => {

    /*
      Evita menu de contexto sobre os vídeos.
    */

    if (
      event.target.closest(".scene")
    ) {

      event.preventDefault();

    }

  }
);


/*
  Impede o gesto de zoom da página
  em navegadores que ainda respeitam
  este tipo de evento.
*/

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

    /*
      Garante que a primeira cena esteja
      sempre no começo.
    */

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

      videos[1].preload = "auto";

      try {
        videos[1].load();
      } catch (error) {
        // Ignorar
      }

    }

  }
);
