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


/* =========================================================
   LOGIN
========================================================= */

const passwordInput =
  document.getElementById(
    "password"
  );

const enterButton =
  document.getElementById(
    "enterButton"
  );

const loginPanel =
  document.querySelector(
    ".login-panel"
  );

const passwordError =
  document.getElementById(
    "passwordError"
  );

const loginVideo =
  document.getElementById(
    "loginVideo"
  );


/* =========================================================
   CONTROLES
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

const blackTransition =
  document.getElementById(
    "blackTransition"
  );


/* =========================================================
   ESTADO
========================================================= */

let currentScene = 0;

let unlocked = false;

let activePointerId = null;

let isHolding = false;

let progressFrame = null;

let changingScene = false;


/* =========================================================
   CONSTANTES
========================================================= */

const SCENE_COUNT =
  scenes.length;

const TRANSITION_TIME = 450;


/* =========================================================
   PROGRESSO
========================================================= */

function clearProgress() {

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


  progressSegments.forEach(
    segment => {

      segment.classList.remove(
        "is-complete"
      );

    }
  );

}


function updateProgress() {

  progressFills.forEach(
    (fill, index) => {

      if (
        index < currentScene
      ) {

        fill.style.width =
          "100%";

        progressSegments[index]
          .classList.add(
            "is-complete"
          );

        return;
      }


      if (
        index > currentScene
      ) {

        fill.style.width =
          "0%";

        progressSegments[index]
          .classList.remove(
            "is-complete"
          );

        return;
      }


      const video =
        videos[index];


      if (
        !video ||
        !Number.isFinite(
          video.duration
        ) ||
        video.duration <= 0
      ) {

        fill.style.width =
          "0%";

        return;
      }


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


      fill.style.width =
        `${percentage}%`;

    }
  );


  progressFrame =
    requestAnimationFrame(
      updateProgress
    );

}


function startProgress() {

  clearProgress();

  updateProgress();

}


/* =========================================================
   VISIBILIDADE
========================================================= */

function activateStoryInterface() {

  experience.classList.add(
    "story-active"
  );

}


function deactivateStoryInterface() {

  experience.classList.remove(
    "story-active"
  );

}


/* =========================================================
   VÍDEO
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


function playCurrentVideo() {

  const video =
    videos[currentScene];


  if (!video) {
    return;
  }


  const promise =
    video.play();


  if (
    promise &&
    promise.catch
  ) {

    promise.catch(
      () => {}
    );

  }

}


/* =========================================================
   CENA
========================================================= */

function startScene(
  index
) {

  const video =
    videos[index];


  if (!video) {
    return;
  }


  currentScene =
    index;


  changingScene = false;


  blackTransition
    .classList.remove(
      "active"
    );


  scenes.forEach(
    (scene, sceneIndex) => {

      if (
        sceneIndex === index
      ) {

        scene.classList.add(
          "active"
        );

      } else {

        scene.classList.remove(
          "active"
        );

      }

    }
  );


  stopVideo(
    video
  );


  /*
    Depois do login,
    o vídeo pode reproduzir
    normalmente.
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


  playCurrentVideo();

  startProgress();

  preloadNext(index);

}


/* =========================================================
   IR PARA CENA
========================================================= */

function goToScene(
  index
) {

  if (
    index < 1 ||
    index >= SCENE_COUNT
  ) {

    return;
  }


  if (
    changingScene
  ) {

    return;
  }


  changingScene = true;


  clearProgress();


  const previousVideo =
    videos[currentScene];


  if (
    previousVideo
  ) {

    previousVideo.pause();

  }


  blackTransition
    .classList.add(
      "active"
    );


  window.setTimeout(
    () => {

      startScene(
        index
      );

    },
    TRANSITION_TIME
  );

}


/* =========================================================
   ANTERIOR
========================================================= */

function previousScene() {

  if (
    currentScene <= 1
  ) {

    return;
  }


  goToScene(
    currentScene - 1
  );

}


/* =========================================================
   PRÓXIMO
========================================================= */

function nextScene() {

  if (
    currentScene >=
    SCENE_COUNT - 1
  ) {

    return;
  }


  goToScene(
    currentScene + 1
  );

}


/* =========================================================
   FINAL DO VÍDEO
========================================================= */

function handleVideoEnd() {

  if (
    currentScene <
    SCENE_COUNT - 1
  ) {

    nextScene();

  } else {

    /*
      Última cena:
      deixa a última barra cheia.
    */

    progressFills[
      currentScene
    ].style.width =
      "100%";

  }

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
    nextIndex >=
    SCENE_COUNT
  ) {

    return;
  }


  const video =
    videos[nextIndex];


  if (!video) {
    return;
  }


  video.preload =
    "auto";


  try {

    video.load();

  } catch (error) {

    // Ignorar

  }

}


/* =========================================================
   PAUSA POR PRESSÃO
========================================================= */

function pauseCurrentVideo() {

  const video =
    videos[currentScene];


  if (!video) {
    return;
  }


  video.pause();

}


/* =========================================================
   CONTINUAR
========================================================= */

function resumeCurrentVideo() {

  const video =
    videos[currentScene];


  if (!video) {
    return;
  }


  if (
    video.ended
  ) {

    return;
  }


  playCurrentVideo();

}


/* =========================================================
   TOUCH — CENTRO
========================================================= */

storyPause.addEventListener(
  "pointerdown",
  event => {

    if (
      !unlocked ||
      currentScene === 0
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


    pauseCurrentVideo();


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


storyPause.addEventListener(
  "pointerup",
  event => {

    if (
      event.pointerId !==
      activePointerId
    ) {

      return;
    }


    if (isHolding) {

      resumeCurrentVideo();

    }


    isHolding = false;

    activePointerId = null;


    event.preventDefault();

  },
  {
    passive: false
  }
);


storyPause.addEventListener(
  "pointercancel",
  event => {

    if (
      event.pointerId !==
      activePointerId
    ) {

      return;
    }


    if (isHolding) {

      resumeCurrentVideo();

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
   TOUCH — ESQUERDA
========================================================= */

storyPrev.addEventListener(
  "pointerup",
  event => {

    if (
      !unlocked ||
      currentScene <= 1
    ) {

      return;
    }


    previousScene();


    event.preventDefault();

  },
  {
    passive: false
  }
);


/* =========================================================
   TOUCH — DIREITA
========================================================= */

storyNext.addEventListener(
  "pointerup",
  event => {

    if (
      !unlocked
    ) {

      return;
    }


    nextScene();


    event.preventDefault();

  },
  {
    passive: false
  }
);


/* =========================================================
   BARRAS
========================================================= */

progressSegments.forEach(
  (segment, index) => {

    segment.addEventListener(
      "pointerup",
      event => {

        if (
          !unlocked
        ) {

          return;
        }


        /*
          A barra 0 pertence ao login
          e não pode ser acessada.
        */

        if (
          index === 0
        ) {

          return;
        }


        if (
          index === currentScene
        ) {

          return;
        }


        goToScene(
          index
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
    Desativa definitivamente
    a interação do login.
  */

  loginPanel.classList.add(
    "hidden"
  );


  /*
    Ativa a interface dos Stories
    somente agora.
  */

  activateStoryInterface();


  /*
    O login deixa de tocar.
  */

  if (
    loginVideo
  ) {

    loginVideo.pause();

  }


  /*
    A primeira cena da experiência
    começa uma única vez.
  */

  window.setTimeout(
    () => {

      goToScene(
        1
      );

    },
    300
  );

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

    if (
      event.key === "Enter"
    ) {

      event.preventDefault();

      unlockExperience();

    }

  }
);


/* =========================================================
   ERRO
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
  (video, index) => {

    if (!video) {
      return;
    }


    video.addEventListener(
      "ended",
      () => {

        if (
          index !== currentScene
        ) {

          return;

        }


        handleVideoEnd();

      }
    );

  }
);


/* =========================================================
   LOGIN VIDEO
========================================================= */

if (
  loginVideo
) {

  loginVideo.muted = true;

  loginVideo.loop = true;

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

      if (
        !unlocked
      ) {

        loginVideo
          .play()
          .catch(
            () => {}
          );

      }

    },
    {
      once: true
    }
  );

}


/* =========================================================
   PREVENIR ZOOM IOS
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

function initialize() {

  unlocked = false;

  currentScene = 0;

  deactivateStoryInterface();

  clearProgress();

  resetProgressBars();


  scenes.forEach(
    (scene, index) => {

      if (
        index === 0
      ) {

        scene.classList.add(
          "active"
        );

      } else {

        scene.classList.remove(
          "active"
        );

      }

    }
  );


  /*
    Login em loop.
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
    Pré-carrega o primeiro
    vídeo da experiência.
  */

  preloadNext(0);

}


window.addEventListener(
  "load",
  initialize
);
