const CONFIG = {
  password: "3xc"
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


/* =========================================================
   CONTROLES DOS STORIES
========================================================= */

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

const LOGIN_SCENE = 0;

const START_SCENE = 1;

const FIRST_STORY = 2;

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

let lastTouchEnd =
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
   PARAR TODOS OS VÍDEOS
========================================================= */

function stopAllVideos() {

  videos.forEach(
    video => {

      if (!video) {
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
        sceneIndex === index
      );

    }
  );

}


/* =========================================================
   RESET DO ÚLTIMO BOTÃO
========================================================= */

function resetFinalButton() {

  if (
    finalButtonTimer !==
    null
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


/* =========================================================
   REVELAR BOTÃO FINAL
========================================================= */

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
   PREPARAR ABERTURA 3 × C
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

  } catch (error) {

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


/* =========================================================
   FINAL DO 3 × C
========================================================= */

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
   COMEÇAR UM STORY
========================================================= */

function startStory(
  index
) {

  const video =
    videos[index];


  if (!video) {
    return;
  }


  currentScene =
    index;


  stopProgress();


  resetFinalButton();


  /*
    Para e silencia todos
    antes da troca.
  */

  stopAllVideos();


  /*
    Reposiciona o vídeo antes
    de mostrar sua cena.
  */

  try {

    video.currentTime =
      0;

  } catch (error) {

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

  video.muted =
    index === LAST_STORY;


  /*
    Mostra a cena.
  */

  showScene(
    index
  );


  /*
    Reproduz.
  */

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
   IR PARA STORY
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


/* =========================================================
   STORY ANTERIOR
========================================================= */

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


/* =========================================================
   STORY SEGUINTE
========================================================= */

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


    if (fill) {

      fill.style.width =
        "100%";

    }


    return;
  }


  nextStory();

}


/* =========================================================
   PAUSAR STORY
========================================================= */

function pauseCurrentStory() {

  const video =
    videos[currentScene];


  if (!video) {
    return;
  }


  video.pause();

}


/* =========================================================
   CONTINUAR STORY
========================================================= */

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


  /*
    O último vídeo continua mudo.
  */

  video.muted =
    currentScene === LAST_STORY;


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
   PRESSÃO NO CENTRO
========================================================= */

storyPause.addEventListener(
  "pointerdown",
  event => {

    if (
      !unlocked ||
      currentScene <
        FIRST_STORY
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

    } catch (error) {

      // Ignorar

    }


    event.preventDefault();

  },
  {
    passive: false
  }
);


/* =========================================================
   SOLTAR NO CENTRO
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
   CANCELAR CENTRO
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
  "pointerup",
  event => {

    if (
      !unlocked ||
      currentScene <
        FIRST_STORY
    ) {

      return;
    }


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
  "pointerup",
  event => {

    if (
      !unlocked ||
      currentScene <
        FIRST_STORY
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
      "pointerup",
      event => {

        if (
          !unlocked
        ) {

          return;
        }


        const targetScene =
          FIRST_STORY +
          index;


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
   FINAL DO VÍDEO 3 × C
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


    startStory(
      FIRST_STORY
    );

  }
);


/* =========================================================
   VÍDEOS DOS STORIES
========================================================= */

videos.forEach(
  (
    video,
    index
  ) => {

    if (!video) {
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

}


/* =========================================================
   BLOQUEIO DE PINCH ZOOM
========================================================= */

document.addEventListener(
  "touchstart",
  event => {

    /*
      Bloqueia dois ou mais dedos.
    */

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
   BLOQUEIO DE GESTO DE ZOOM
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
   BLOQUEIO DE ZOOM POR DUPLO TOQUE
========================================================= */

document.addEventListener(
  "touchend",
  event => {

    const now =
      Date.now();


    const timeSinceLastTouch =
      now -
      lastTouchEnd;


    /*
      Evita o zoom causado por
      dois toques rápidos.
    */

    if (
      timeSinceLastTouch < 300
    ) {

      /*
        Permite o campo de senha
        manter seu comportamento normal.
      */

      if (
        !event.target.closest(
          "input"
        )
      ) {

        event.preventDefault();

      }

    }


    lastTouchEnd =
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

      if (!video) {
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

        } catch (error) {

          // Ignorar

        }

      }

    }
  );


  /*
    Login em loop.
  */

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


  /*
    Story 1 pré-carregado.
  */

  preloadNext(
    START_SCENE
  );

}


window.addEventListener(
  "load",
  initialize
);
