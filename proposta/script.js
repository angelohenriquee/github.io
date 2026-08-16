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
   ÁREAS DE TOQUE
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
   ESTADO

   0 = LOGIN
   1 = STORY 1
   2 = STORY 2
   ...
   8 = STORY 8
========================================================= */

let currentScene = 0;

let unlocked = false;

let activePointerId = null;

let isHolding = false;

let progressFrame = null;


/* =========================================================
   CONSTANTES
========================================================= */

const FIRST_STORY = 1;

const LAST_STORY =
  scenes.length - 1;


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

    progressFrame = null;
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
    currentScene < FIRST_STORY
  ) {

    stopProgress();

    return;
  }


  /*
    Barras anteriores = completas.
  */

  progressFills.forEach(
    (fill, index) => {

      if (
        index <
        currentScene - 1
      ) {

        fill.style.width =
          "100%";

      }

      else if (
        index >
        currentScene - 1
      ) {

        fill.style.width =
          "0%";

      }

    }
  );


  /*
    Barra atual acompanha o vídeo.
  */

  const currentFill =
    progressFills[
      currentScene - 1
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
   VISIBILIDADE
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
   PARAR VÍDEO
========================================================= */

function stopVideo(
  video
) {

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


/* =========================================================
   SILENCIAR E PARAR TODOS OS VÍDEOS
========================================================= */

function stopAllVideosExcept(
  activeIndex
) {

  videos.forEach(
    (video, index) => {

      if (!video) {
        return;
      }


      /*
        Todo vídeo que não seja o atual:
        - pausa
        - silencia
        - volta ao primeiro frame
      */

      if (
        index !== activeIndex
      ) {

        video.pause();

        video.muted = true;


        try {

          video.currentTime = 0;

        } catch (error) {

          // Ignorar

        }

      }

    }
  );

}


/* =========================================================
   REPRODUZIR VÍDEO
========================================================= */

function playVideo(
  video
) {

  if (!video) {
    return;
  }


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
   PRÓXIMO VÍDEO
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
   COMEÇAR STORY
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
    PRIMEIRO:
    pausa e silencia TODOS os vídeos.

    Isso resolve o áudio residual
    no computador.
  */

  videos.forEach(
    videoItem => {

      if (!videoItem) {
        return;
      }


      videoItem.pause();

      videoItem.muted = true;

    }
  );


  /*
    Atualiza as cenas
    instantaneamente.
  */

  scenes.forEach(
    (scene, sceneIndex) => {

      scene.classList.toggle(
        "active",
        sceneIndex === index
      );

    }
  );


  /*
    Começa o vídeo atual
    sempre do início.
  */

  try {

    video.currentTime = 0;

  } catch (error) {

    // Ignorar

  }


  /*
    SOMENTE o vídeo atual
    terá áudio.
  */

  video.muted = false;

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
    Agora reproduzimos o vídeo atual.
  */

  playVideo(
    video
  );


  /*
    Pré-carrega o seguinte.
  */

  preloadNext(
    index
  );


  /*
    Reinicia a barra de progresso.
  */

  startProgress();

}


/* =========================================================
   IR PARA STORY
========================================================= */

function goToStory(
  index
) {

  if (
    !unlocked
  ) {

    return;
  }


  if (
    index < FIRST_STORY ||
    index > LAST_STORY
  ) {

    return;
  }


  if (
    index === currentScene
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
    Story 1 não volta para o login.
  */

  if (
    currentScene <= FIRST_STORY
  ) {

    return;
  }


  goToStory(
    currentScene - 1
  );

}


/* =========================================================
   PRÓXIMO STORY
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
   FINAL DO VÍDEO
========================================================= */

function handleStoryEnd() {

  if (
    currentScene >=
    LAST_STORY
  ) {

    /*
      Último Story:
      deixa a última barra cheia.
    */

    const fill =
      progressFills[
        LAST_STORY - 1
      ];


    if (fill) {

      fill.style.width =
        "100%";

    }


    return;
  }


  /*
    Avança automaticamente
    para o próximo Story.
  */

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


/* =========================================================
   CONTINUAR
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
    Garante novamente que
    somente a cena atual tenha áudio.
  */

  videos.forEach(
    (videoItem, index) => {

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

        videoItem.muted = true;

      }

    }
  );


  video.muted = false;


  playVideo(
    video
  );

}


/* =========================================================
   PRESSÃO — CENTRO
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
      activePointerId !== null
    ) {

      return;
    }


    activePointerId =
      event.pointerId;


    isHolding = true;


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
   SOLTAR — CENTRO
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


    isHolding = false;

    activePointerId = null;


    event.preventDefault();

  },
  {
    passive: false
  }
);


/* =========================================================
   CANCELAR — CENTRO
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


    isHolding = false;

    activePointerId = null;


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
      !unlocked
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
      !unlocked
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
          etc.
        */

        const targetStory =
          index +
          FIRST_STORY;


        goToStory(
          targetStory
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


  unlocked = true;


  /*
    Esconde o login.
  */

  loginPanel.classList.add(
    "hidden"
  );


  /*
    Para o loop do login.
  */

  if (
    loginVideo
  ) {

    loginVideo.pause();

    loginVideo.muted = true;

  }


  /*
    Ativa as barras e áreas
    de interação.
  */

  activateStories();


  /*
    Entra diretamente no Story 1.
  */

  startStory(
    FIRST_STORY
  );

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
   VÍDEOS
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
          Login não pertence
          à sequência.
        */

        if (
          index === 0
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
   LOGIN
========================================================= */

if (
  loginVideo
) {

  loginVideo.loop = true;

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

}


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

  unlocked = false;

  currentScene = 0;


  deactivateStories();


  resetProgressBars();


  /*
    Somente o login fica ativo.
  */

  scenes.forEach(
    (
      scene,
      index
    ) => {

      scene.classList.toggle(
        "active",
        index === 0
      );

    }
  );


  /*
    Garante que todos os vídeos
    estejam inicialmente parados
    e sem áudio, exceto o login.
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

      video.muted = true;


      if (
        index !== 0
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
    Login em looping.
  */

  if (
    loginVideo
  ) {

    loginVideo.loop = true;

    loginVideo.muted = true;


    loginVideo.play()
      .catch(
        () => {}
      );

  }


  /*
    Pré-carrega Story 1.
  */

  preloadNext(0);

}


window.addEventListener(
  "load",
  initialize
);
