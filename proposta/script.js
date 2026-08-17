const CONFIG = {
  password: "novoeditorial"
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
   9 = STORY 8
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


  /*
    Barras anteriores.
  */

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


  /*
    Barra atual.
  */

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
   PREPARAR ABERTURA 3 × C
========================================================= */

function prepareStartScreen() {

  if (
    !startVideo
  ) {

    return;

  }


  /*
    Sempre começa escondido.
  */

  startScreen.classList.remove(
    "ready"
  );


  /*
    O vídeo não tem loop.
  */

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


  /*
    Começa o vídeo imediatamente.
    Como está mutado, o navegador
    pode reproduzi-lo após a interação
    do botão "Entrar".
  */

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
   FINAL DO VÍDEO 3 × C
========================================================= */

function revealStartButton() {

  if (
    !startScreen
  ) {

    return;

  }


  /*
    O botão aparece somente
    depois que o vídeo terminou.
  */

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


  /*
    Para e silencia TODOS
    antes da troca.
  */

  stopAllVideos();


  /*
    Coloca o vídeo de destino
    no primeiro frame ANTES
    de mostrar a cena.
  */

  try {

    video.currentTime =
      0;

  } catch (error) {

    // Ignorar

  }


  video.muted =
    true;


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
    Agora mostramos a cena.
  */

  showScene(
    index
  );


  /*
    Agora libera o áudio.
  */

  video.muted =
    false;


  /*
    Reprodução imediata.
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


  /*
    Pré-carrega o próximo.
  */

  preloadNext(
    index
  );


  startProgress();

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

  /*
    Story 1 não volta
    para a abertura.
  */

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


  /*
    Mantém todos os demais
    vídeos parados e mudos.
  */

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
    false;


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


        /*
          Barra 0 = Story 1
          Barra 1 = Story 2
          ...
          Barra 7 = Story 8
        */

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


  /*
    Para o login.
  */

  if (
    loginVideo
  ) {

    loginVideo.pause();

    loginVideo.muted =
      true;

  }


  /*
    Esconde o painel.
  */

  loginPanel.classList.add(
    "hidden"
  );


  /*
    Mostra a abertura 3 × C.
  */

  showScene(
    START_SCENE
  );


  /*
    As barras continuam escondidas.
  */

  deactivateStories();


  /*
    Nenhum Story começa ainda.
  */

  stopAllVideos();


  /*
    Inicia o vídeo 3 × C.
  */

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
    () => {

      revealStartButton();

    }
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


    /*
      As barras entram
      somente agora.
    */

    activateStories();


    /*
      Começa o primeiro Story.
    */

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

        /*
          Login não participa.
        */

        if (
          index ===
          LOGIN_SCENE
        ) {

          return;

        }


        /*
          3 × C não participa da
          navegação dos Stories.
        */

        if (
          index ===
          START_SCENE
        ) {

          return;

        }


        /*
          Apenas o Story atual
          pode avançar.
        */

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
   LOGIN EM LOOP
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
   VÍDEO 3 × C
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
   BLOQUEIO DE ZOOM IOS
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


  /*
    Esconde o botão Começar
    inicialmente.
  */

  if (
    startScreen
  ) {

    startScreen.classList.remove(
      "ready"
    );

  }


  /*
    Somente o Login aparece.
  */

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


  /*
    Todos os vídeos começam
    parados e sem áudio.
  */

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
    Login começa em loop.
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
    Pré-carrega o Story 1.
  */

  preloadNext(
    START_SCENE
  );

}


window.addEventListener(
  "load",
  initialize
);
