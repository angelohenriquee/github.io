const CONFIG = {
  password: "novoeditorial",

  whatsappNumber: "55SEUNUMERO",

  whatsappMessage:
    "Olá, Ângelo. Vi a experiência e gostaria de conversar sobre ela."
};


/* =========================================================
   ELEMENTOS
========================================================= */

const scenes =
  [...document.querySelectorAll(".scene")];

const videos =
  scenes.map(scene =>
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
  document.getElementById(
    "blackTransition"
  );


/* =========================================================
   ESTADO
========================================================= */

let currentScene = 0;

let unlocked = false;

let isHolding = false;

let holdPointerId = null;

let sceneFinished = false;

let navigationTimer = null;

let blackTimer = null;


/* =========================================================
   TEMPOS
========================================================= */

const BUTTON_DELAY = 650;

const BLACK_DELAY = 250;

const TRANSITION_DURATION = 900;


/* =========================================================
   LIMPEZA
========================================================= */

function clearTimers() {

  window.clearTimeout(
    navigationTimer
  );

  window.clearTimeout(
    blackTimer
  );

}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function hideNavigation() {

  window.clearTimeout(
    navigationTimer
  );

  navigation.classList.remove(
    "visible"
  );

  backButton.hidden = true;

  nextButton.hidden = true;
}


function updateNavigation() {

  /*
    O botão Avançar fica sempre disponível.
  */

  nextButton.hidden = false;


  /*
    Primeira cena da experiência:
    não existe Voltar.
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


function showNavigation() {

  window.clearTimeout(
    navigationTimer
  );


  navigationTimer =
    window.setTimeout(() => {

      if (!unlocked) {
        return;
      }

      updateNavigation();

      navigation.classList.add(
        "visible"
      );

    }, BUTTON_DELAY);

}


/* =========================================================
   RESET
========================================================= */

function resetVideo(video) {

  if (!video) {
    return;
  }

  video.pause();


  try {

    video.currentTime = 0;

  } catch (error) {

    // Ignorar

  }

}


function resetFinishing(scene) {

  if (!scene) {
    return;
  }

  scene.classList.remove(
    "finishing"
  );

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
    O próprio elemento <video>
    já está parado no último frame.

    Não usamos canvas.
    Isso é deliberado para melhorar
    a compatibilidade com Safari/iPhone.
  */

  video.pause();


  /*
    Garante que estamos próximos do último
    frame sem forçar uma nova busca.
  */

  try {

    if (
      Number.isFinite(
        video.duration
      )
    ) {

      video.currentTime =
        Math.max(
          0,
          video.duration - 0.01
        );

    }

  } catch (error) {

    // Ignorar

  }


  /*
    Primeiro:
    último frame + blur.
  */

  scene.classList.add(
    "finishing"
  );


  /*
    Depois:
    atenuar para preto.
  */

  blackTimer =
    window.setTimeout(() => {

      blackTransition.classList.add(
        "active"
      );

    }, BLACK_DELAY);


  /*
    Depois do preto,
    aparecem os botões.
  */

  navigationTimer =
    window.setTimeout(() => {

      if (!unlocked) {
        return;
      }

      updateNavigation();

      navigation.classList.add(
        "visible"
      );

    }, BUTTON_DELAY + BLACK_DELAY);

}


/* =========================================================
   FALLBACK PARA IOS
========================================================= */

/*
  Alguns navegadores móveis podem ser discretos
  com o evento "ended". Por isso também observamos
  o progresso do vídeo e tratamos o momento final.
*/

function attachEndDetection(
  scene,
  video
) {

  if (
    scene.dataset.endBound ===
    "true"
  ) {

    return;

  }


  scene.dataset.endBound =
    "true";


  video.addEventListener(
    "ended",
    () => {

      finishScene(
        currentScene
      );

    }
  );


  video.addEventListener(
    "timeupdate",
    () => {

      if (
        sceneFinished ||
        video.readyState < 2
      ) {

        return;

      }


      if (
        !Number.isFinite(
          video.duration
        )
      ) {

        return;

      }


      /*
        50 ms antes do final.
      */

      if (
        video.duration -
          video.currentTime <=
        0.05
      ) {

        finishScene(
          currentScene
        );

      }

    }
  );

}


/* =========================================================
   REPRODUÇÃO
========================================================= */

function playScene(index) {

  const scene =
    scenes[index];

  const video =
    videos[index];


  if (!scene || !video) {
    return;
  }


  clearTimers();


  sceneFinished = false;

  isHolding = false;

  holdPointerId = null;


  resetFinishing(
    scene
  );


  blackTransition.classList.remove(
    "active"
  );


  hideNavigation();


  resetVideo(video);


  /*
    Login sempre mudo.
  */

  if (index === 0) {

    video.muted = true;

  } else {

    video.muted = false;

  }


  video.playsInline = true;


  video.setAttribute(
    "playsinline",
    ""
  );


  video.setAttribute(
    "webkit-playsinline",
    ""
  );


  /*
    Evento de finalização.
  */

  attachEndDetection(
    scene,
    video
  );


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
    Reprodução.
  */

  function startPlayback() {

    const promise =
      video.play();


    if (promise) {

      promise.catch(() => {

        /*
          Fallback silencioso.
        */

        if (index !== 0) {

          video.muted = true;

          video.play()
            .catch(() => {});

        }

      });

    }

  }


  if (
    video.readyState >= 3
  ) {

    startPlayback();

  } else {

    video.addEventListener(
      "canplay",
      startPlayback,
      {
        once: true
      }
    );

  }


  preloadNext(
    index
  );

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

    promise.catch(
      () => {}
    );

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
        event.pointerType ===
          "mouse" &&
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


      pauseVideo(
        video
      );

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

        resumeVideo(
          video
        );

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

        resumeVideo(
          video
        );

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


  clearTimers();


  const previousScene =
    scenes[currentScene];

  const nextScene =
    scenes[index];

  const previousVideo =
    videos[currentScene];


  sceneFinished = false;

  isHolding = false;

  holdPointerId = null;


  hideNavigation();


  blackTransition.classList.remove(
    "active"
  );


  resetFinishing(
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


    goToScene(
      1
    );

  }, 350);

}


/* =========================================================
   LOGIN
========================================================= */

enterButton.addEventListener(
  "click",
  unlockExperience
);


passwordInput.addEventListener(
  "keydown",
  event => {

    if (
      event.key ===
      "Enter"
    ) {

      event.preventDefault();

      unlockExperience();

    }

  }
);


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
   LOGIN VIDEO
========================================================= */

const loginVideo =
  videos[0];


if (loginVideo) {

  loginVideo.muted = true;

  loginVideo.playsInline = true;


  loginVideo.addEventListener(
    "canplay",
    () => {

      loginVideo
        .play()
        .catch(() => {});

    },
    {
      once: true
    }
  );

}


/* =========================================================
   MENU DE CONTEXTO
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
   ZOOM IOS
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


    scenes.forEach(
      scene => {

        if (
          scene.dataset.scene !==
          "0"
        ) {

          scene.classList.remove(
            "active"
          );

        }

      }
    );


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
