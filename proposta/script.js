const CONFIG = {
  password: "3xc",

  whatsappUrl:
    "https://wa.me/5531972055172?text=Ol%C3%A1%2C%20%C3%82ngelo.%20Conheci%20o%20projeto%203%20%C3%97%20C%20e%20quero%20fazer%20parte.%20Gostaria%20de%20seguir%20com%20a%20contrata%C3%A7%C3%A3o."
};


/* =========================================================
   ELEMENTOS
========================================================= */

const experience =
  document.getElementById(
    "experience"
  );


const scenes =
  [
    ...document.querySelectorAll(
      ".scene"
    )
  ];


const videos =
  scenes.map(
    scene =>
      scene.querySelector(
        ".scene-video"
      )
  );


const progressSegments =
  [
    ...document.querySelectorAll(
      ".story-segment"
    )
  ];


const progressFills =
  [
    ...document.querySelectorAll(
      ".story-fill"
    )
  ];


/* =========================================================
   LOGIN
========================================================= */

const loginVideo =
  document.getElementById(
    "loginVideo"
  );


const loginPanel =
  document.querySelector(
    ".login-panel"
  );


const passwordInput =
  document.getElementById(
    "password"
  );


const passwordError =
  document.getElementById(
    "passwordError"
  );


const enterButton =
  document.getElementById(
    "enterButton"
  );


/* =========================================================
   ABERTURA 3 × C
========================================================= */

const startVideo =
  document.getElementById(
    "startVideo"
  );


const startScreen =
  document.querySelector(
    ".start-screen"
  );


const startButton =
  document.getElementById(
    "startButton"
  );


/* =========================================================
   ÚLTIMO STORY
========================================================= */

const finalVideo =
  document.getElementById(
    "finalVideo"
  );


const finalStory =
  document.querySelector(
    ".final-story"
  );


const finalPanel =
  document.getElementById(
    "finalPanel"
  );


const whatsappButton =
  document.getElementById(
    "whatsappButton"
  );


/* =========================================================
   CONTROLES DOS STORIES
========================================================= */

const storyControls =
  document.getElementById(
    "storyControls"
  );


const storyPrev =
  document.getElementById(
    "storyPrev"
  );


const storyPause =
  document.getElementById(
    "storyPause"
  );


const storyNext =
  document.getElementById(
    "storyNext"
  );


/* =========================================================
   ÍNDICES

   0 = LOGIN
   1 = ABERTURA 3 × C
   2 = STORY 1
   3 = STORY 2
   4 = STORY 3
   5 = STORY 4
   6 = STORY 5
   7 = STORY 6
   8 = STORY 7
   9 = STORY 8 / ÚLTIMO
========================================================= */

const LOGIN_SCENE =
  0;


const START_SCENE =
  1;


const FIRST_STORY =
  2;


const LAST_STORY =
  scenes.length - 1;


/* =========================================================
   ESTADO
========================================================= */

let currentScene =
  LOGIN_SCENE;


let unlocked =
  false;


let activePointerId =
  null;


let isHolding =
  false;


let progressFrame =
  null;


let finalButtonTimer =
  null;


let lastTouchStart =
  0;


/* =========================================================
   PROGRESSO
========================================================= */

function stopProgress() {

  if (
    progressFrame !== null
  ) {

    cancelAnimationFrame(
      progressFrame
    );


    progressFrame =
      null;

  }

}


function resetProgressBars() {

  progressFills.forEach(
    fill => {

      fill.style.width =
        "0%";

    }
  );

}


function updateProgress() {

  if (
    !unlocked ||
    currentScene <
      FIRST_STORY
  ) {

    stopProgress();

    return;

  }


  const storyIndex =
    currentScene -
    FIRST_STORY;


  progressFills.forEach(
    (
      fill,
      index
    ) => {

      if (
        index <
        storyIndex
      ) {

        fill.style.width =
          "100%";

      }

      else if (
        index >
        storyIndex
      ) {

        fill.style.width =
          "0%";

      }

    }
  );


  const currentFill =
    progressFills[
      storyIndex
    ];


  const video =
    videos[currentScene];


  if (
    currentFill &&
    video &&
    Number.isFinite(
      video.duration
    ) &&
    video.duration > 0
  ) {

    const percentage =
      Math.min(
        100,
        Math.max(
          0,
          (
            video.currentTime /
            video.duration
          ) * 100
        )
      );


    currentFill.style.width =
      `${percentage}%`;

  }


  progressFrame =
    requestAnimationFrame(
      updateProgress
    );

}


function startProgress() {

  stopProgress();

  updateProgress();

}


/* =========================================================
   INTERFACE DOS STORIES
========================================================= */

function activateStories() {

  experience.classList.add(
    "story-active"
  );

}


function deactivateStories() {

  experience.classList.remove(
    "story-active"
  );

}


/* =========================================================
   CONTROLES DO ÚLTIMO STORY
========================================================= */

function disableStoryControlsForFinal() {

  if (
    storyControls
  ) {

    storyControls.classList.add(
      "final-lock"
    );

  }

}


function enableStoryControls() {

  if (
    storyControls
  ) {

    storyControls.classList.remove(
      "final-lock"
    );

  }

}


/* =========================================================
   PARAR TODOS OS VÍDEOS
========================================================= */

function stopAllVideos() {

  videos.forEach(
    video => {

      if (
        !video
      ) {

        return;

      }


      video.pause();

      video.muted =
        true;

    }
  );

}


/* =========================================================
   PRELOAD
========================================================= */

function preloadNext(
  index
) {

  const nextIndex =
    index + 1;


  if (
    nextIndex >
    LAST_STORY
  ) {

    return;

  }


  const nextVideo =
    videos[nextIndex];


  if (
    !nextVideo
  ) {

    return;

  }


  nextVideo.preload =
    "auto";


  try {

    nextVideo.load();

  } catch (
    error
  ) {

    // Ignorar

  }

}


/* =========================================================
   MOSTRAR CENA
========================================================= */

function showScene(
  index
) {

  scenes.forEach(
    (
      scene,
      sceneIndex
    ) => {

      scene.classList.toggle(
        "active",
        sceneIndex ===
          index
      );

    }
  );

}


/* =========================================================
   BOTÃO FINAL
========================================================= */

function resetFinalButton() {

  if (
    finalButtonTimer !== null
  ) {

    clearTimeout(
      finalButtonTimer
    );


    finalButtonTimer =
      null;

  }


  if (
    finalStory
  ) {

    finalStory.classList.remove(
      "final-ready"
    );

  }

}


function scheduleFinalButton() {

  resetFinalButton();


  finalButtonTimer =
    window.setTimeout(
      () => {

        if (
          currentScene ===
          LAST_STORY
        ) {

          finalStory.classList.add(
            "final-ready"
          );

        }


        finalButtonTimer =
          null;

      },
      1000
    );

}


/* =========================================================
   TELA 3 × C
========================================================= */

function prepareStartScreen() {

  if (
    !startVideo
  ) {

    return;

  }


  startScreen.classList.remove(
    "ready"
  );


  startVideo.loop =
    false;


  startVideo.muted =
    true;


  startVideo.playsInline =
    true;


  startVideo.setAttribute(
    "playsinline",
    ""
  );


  startVideo.setAttribute(
    "webkit-playsinline",
    ""
  );


  try {

    startVideo.currentTime =
      0;

  } catch (
    error
  ) {

    // Ignorar

  }


  const promise =
    startVideo.play();


  if (
    promise &&
    typeof promise.catch ===
      "function"
  ) {

    promise.catch(
      () => {}
    );

  }

}


function revealStartButton() {

  if (
    !startScreen
  ) {

    return;

  }


  startScreen.classList.add(
    "ready"
  );

}


/* =========================================================
   INICIAR STORY
========================================================= */

function startStory(
  index
) {

  const video =
    videos[index];


  if (
    !video
  ) {

    return;

  }


  currentScene =
    index;


  stopProgress();


  resetFinalButton();


  stopAllVideos();


  try {

    video.currentTime =
      0;

  } catch (
    error
  ) {

    // Ignorar

  }


  video.playsInline =
    true;


  video.setAttribute(
    "playsinline",
    ""
  );


  video.setAttribute(
    "webkit-playsinline",
    ""
  );


  /*
    O último vídeo é sempre mudo.
  */

  if (
    index ===
    LAST_STORY
  ) {

    video.muted =
      true;


    video.defaultMuted =
      true;


    disableStoryControlsForFinal();

  }

  else {

    video.muted =
      false;


    enableStoryControls();

  }


  showScene(
    index
  );


  const playPromise =
    video.play();


  if (
    playPromise &&
    typeof playPromise.catch ===
      "function"
  ) {

    playPromise.catch(
      () => {}
    );

  }


  preloadNext(
    index
  );


  startProgress();


  if (
    index ===
    LAST_STORY
  ) {

    scheduleFinalButton();

  }

}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function goToStory(
  index
) {

  if (
    index <
      FIRST_STORY ||
    index >
      LAST_STORY
  ) {

    return;

  }


  if (
    index ===
    currentScene
  ) {

    return;

  }


  startStory(
    index
  );

}


function previousStory() {

  if (
    currentScene <=
    FIRST_STORY
  ) {

    return;

  }


  goToStory(
    currentScene - 1
  );

}


function nextStory() {

  if (
    currentScene >=
    LAST_STORY
  ) {

    return;

  }


  goToStory(
    currentScene + 1
  );

}


/* =========================================================
   FINAL DO STORY
========================================================= */

function handleStoryEnd() {

  if (
    currentScene >=
    LAST_STORY
  ) {

    const storyIndex =
      currentScene -
      FIRST_STORY;


    const fill =
      progressFills[
        storyIndex
      ];


    if (
      fill
    ) {

      fill.style.width =
        "100%";

    }


    return;

  }


  nextStory();

}


/* =========================================================
   PAUSAR
========================================================= */

function pauseCurrentStory() {

  const video =
    videos[currentScene];


  if (
    !video
  ) {

    return;

  }


  video.pause();

}


function resumeCurrentStory() {

  const video =
    videos[currentScene];


  if (
    !video ||
    video.ended
  ) {

    return;

  }


  videos.forEach(
    (
      videoItem,
      index
    ) => {

      if (
        !videoItem
      ) {

        return;

      }


      if (
        index !==
        currentScene
      ) {

        videoItem.pause();

        videoItem.muted =
          true;

      }

    }
  );


  video.muted =
    currentScene ===
    LAST_STORY;


  const promise =
    video.play();


  if (
    promise &&
    typeof promise.catch ===
      "function"
  ) {

    promise.catch(
      () => {}
    );

  }

}


/* =========================================================
   SEGURAR NO CENTRO
========================================================= */

storyPause.addEventListener(
  "pointerdown",
  event => {

    if (
      !unlocked ||
      currentScene <
        FIRST_STORY ||
      currentScene ===
        LAST_STORY
    ) {

      return;

    }


    if (
      activePointerId !==
      null
    ) {

      return;

    }


    activePointerId =
      event.pointerId;


    isHolding =
      true;


    pauseCurrentStory();


    try {

      storyPause.setPointerCapture(
        event.pointerId
      );

    } catch (
      error
    ) {

      // Ignorar

    }


    event.preventDefault();

  },
  {
    passive: false
  }
);


/* =========================================================
   SOLTAR
========================================================= */

storyPause.addEventListener(
  "pointerup",
  event => {

    if (
      event.pointerId !==
      activePointerId
    ) {

      return;

    }


    if (
      isHolding
    ) {

      resumeCurrentStory();

    }


    isHolding =
      false;


    activePointerId =
      null;


    event.preventDefault();

  },
  {
    passive: false
  }
);


/* =========================================================
   CANCELAR
========================================================= */

storyPause.addEventListener(
  "pointercancel",
  event => {

    if (
      event.pointerId !==
      activePointerId
    ) {

      return;

    }


    if (
      isHolding
    ) {

      resumeCurrentStory();

    }


    isHolding =
      false;


    activePointerId =
      null;


    event.preventDefault();

  },
  {
    passive: false
  }
);


/* =========================================================
   TOQUE ESQUERDO
========================================================= */

storyPrev.addEventListener(
  "pointerdown",
  event => {

    event.preventDefault();

  },
  {
    passive: false
  }
);


storyPrev.addEventListener(
  "pointerup",
  event => {

    if (
      !unlocked ||
      currentScene <
        FIRST_STORY
    ) {

      return;

    }


    /*
      Agora também funciona
      no último Story.
    */

    previousStory();


    event.preventDefault();

  },
  {
    passive: false
  }
);


/* =========================================================
   TOQUE DIREITO
========================================================= */

storyNext.addEventListener(
  "pointerdown",
  event => {

    event.preventDefault();

  },
  {
    passive: false
  }
);


storyNext.addEventListener(
  "pointerup",
  event => {

    if (
      !unlocked ||
      currentScene <
        FIRST_STORY ||
      currentScene ===
        LAST_STORY
    ) {

      return;

    }


    nextStory();


    event.preventDefault();

  },
  {
    passive: false
  }
);


/* =========================================================
   CLIQUE NAS BARRAS
========================================================= */

progressSegments.forEach(
  (
    segment,
    index
  ) => {

    segment.addEventListener(
      "pointerdown",
      event => {

        event.preventDefault();

      },
      {
        passive: false
      }
    );


    segment.addEventListener(
      "pointerup",
      event => {

        if (
          !unlocked
        ) {

          return;

        }


        /*
          Agora também é possível
          clicar nas barras anteriores
          estando no último Story.
        */

        const targetScene =
          FIRST_STORY +
          index;


        if (
          targetScene >=
          currentScene
        ) {

          return;

        }


        goToStory(
          targetScene
        );


        event.preventDefault();

      },
      {
        passive: false
      }
    );

  }
);


/* =========================================================
   LOGIN
========================================================= */

function unlockExperience() {

  const enteredPassword =
    passwordInput.value.trim();


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


  unlocked =
    true;


  if (
    loginVideo
  ) {

    loginVideo.pause();

    loginVideo.muted =
      true;

  }


  loginPanel.classList.add(
    "hidden"
  );


  showScene(
    START_SCENE
  );


  deactivateStories();


  enableStoryControls();


  stopAllVideos();


  prepareStartScreen();

}


/* =========================================================
   BOTÃO ENTRAR
========================================================= */

enterButton.addEventListener(
  "click",
  unlockExperience
);


/* =========================================================
   ENTER NO CAMPO
========================================================= */

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
   FIM DO 3 × C
========================================================= */

if (
  startVideo
) {

  startVideo.addEventListener(
    "ended",
    revealStartButton
  );

}


/* =========================================================
   BOTÃO COMEÇAR
========================================================= */

startButton.addEventListener(
  "click",
  () => {

    if (
      !unlocked
    ) {

      return;

    }


    activateStories();


    enableStoryControls();


    startStory(
      FIRST_STORY
    );

  }
);


/* =========================================================
   BOTÃO FINAL — WHATSAPP
========================================================= */

if (
  whatsappButton
) {

  whatsappButton.addEventListener(
    "click",
    event => {

      event.preventDefault();

      event.stopPropagation();


      if (
        currentScene !==
        LAST_STORY
      ) {

        return;

      }


      window.location.assign(
        CONFIG.whatsappUrl
      );

    },
    {
      passive: false
    }
  );

}


/* =========================================================
   EVENTOS DE FINAL DOS VÍDEOS
========================================================= */

videos.forEach(
  (
    video,
    index
  ) => {

    if (
      !video
    ) {

      return;

    }


    video.addEventListener(
      "ended",
      () => {

        if (
          index ===
          LOGIN_SCENE
        ) {

          return;

        }


        if (
          index ===
          START_SCENE
        ) {

          return;

        }


        if (
          index !==
          currentScene
        ) {

          return;

        }


        handleStoryEnd();

      }
    );

  }
);


/* =========================================================
   CONFIGURAÇÃO DO LOGIN
========================================================= */

if (
  loginVideo
) {

  loginVideo.loop =
    true;


  loginVideo.muted =
    true;


  loginVideo.playsInline =
    true;


  loginVideo.setAttribute(
    "playsinline",
    ""
  );


  loginVideo.setAttribute(
    "webkit-playsinline",
    ""
  );

}


/* =========================================================
   CONFIGURAÇÃO DO 3 × C
========================================================= */

if (
  startVideo
) {

  startVideo.loop =
    false;


  startVideo.muted =
    true;


  startVideo.playsInline =
    true;


  startVideo.setAttribute(
    "playsinline",
    ""
  );


  startVideo.setAttribute(
    "webkit-playsinline",
    ""
  );

}


/* =========================================================
   CONFIGURAÇÃO DO ÚLTIMO VÍDEO
========================================================= */

if (
  finalVideo
) {

  finalVideo.loop =
    false;


  finalVideo.muted =
    true;


  finalVideo.defaultMuted =
    true;


  finalVideo.playsInline =
    true;


  finalVideo.setAttribute(
    "muted",
    ""
  );


  finalVideo.setAttribute(
    "playsinline",
    ""
  );


  finalVideo.setAttribute(
    "webkit-playsinline",
    ""
  );

}


/* =========================================================
   BLOQUEIO DE PINCH ZOOM
========================================================= */

document.addEventListener(
  "touchstart",
  event => {

    if (
      event.touches.length > 1
    ) {

      event.preventDefault();

    }

  },
  {
    passive: false
  }
);


document.addEventListener(
  "touchmove",
  event => {

    if (
      event.touches.length > 1
    ) {

      event.preventDefault();

    }

  },
  {
    passive: false
  }
);


/* =========================================================
   GESTOS SAFARI
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
   DOUBLE TAP ZOOM FIX
========================================================= */

document.addEventListener(
  "touchstart",
  event => {

    const now =
      Date.now();


    const elapsed =
      now -
      lastTouchStart;


    const isInteractiveElement =
      event.target.closest(
        "input, button, a"
      );


    if (
      elapsed < 300 &&
      !isInteractiveElement
    ) {

      event.preventDefault();

    }


    lastTouchStart =
      now;

  },
  {
    passive: false
  }
);


/* =========================================================
   MENU DE CONTEXTO
========================================================= */

document.addEventListener(
  "contextmenu",
  event => {

    if (
      event.target.closest(
        ".story-stage"
      ) ||
      event.target.closest(
        ".story-controls"
      )
    ) {

      event.preventDefault();

    }

  }
);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

function initialize() {

  unlocked =
    false;


  currentScene =
    LOGIN_SCENE;


  deactivateStories();


  enableStoryControls();


  resetProgressBars();


  stopProgress();


  resetFinalButton();


  if (
    startScreen
  ) {

    startScreen.classList.remove(
      "ready"
    );

  }


  scenes.forEach(
    (
      scene,
      index
    ) => {

      scene.classList.toggle(
        "active",
        index ===
          LOGIN_SCENE
      );

    }
  );


  videos.forEach(
    (
      video,
      index
    ) => {

      if (
        !video
      ) {

        return;

      }


      video.pause();


      video.muted =
        true;


      if (
        index !==
        LOGIN_SCENE
      ) {

        try {

          video.currentTime =
            0;

        } catch (
          error
        ) {

          // Ignorar

        }

      }

    }
  );


  if (
    loginVideo
  ) {

    loginVideo.loop =
      true;


    loginVideo.muted =
      true;


    loginVideo.play()
      .catch(
        () => {}
      );

  }


  preloadNext(
    START_SCENE
  );

}


window.addEventListener(
  "load",
  initialize
);
