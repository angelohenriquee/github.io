const CONFIG = {
  password: "novoeditorial",

  whatsappNumber: "55SEUNUMERO",

  whatsappMessage:
    "Olá, Ângelo. Vi a experiência e gostaria de conversar sobre ela."
};


/* =========================================================
   ELEMENTOS
========================================================= */

const experience =
  document.getElementById("experience");

const storyStage =
  document.getElementById("storyStage");

const storyProgress =
  document.getElementById("storyProgress");

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
  scenes.map(scene =>
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

const passwordError =
  document.getElementById(
    "passwordError"
  );

const loginPanel =
  document.querySelector(
    ".login-panel"
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
   TRANSIÇÃO
========================================================= */

const blackTransition =
  document.getElementById(
    "blackTransition"
  );


/* =========================================================
   ESTADO
========================================================= */

/*
  0 = login
  1 = primeiro vídeo da proposta
  ...
  8 = último vídeo
*/

let currentScene = 0;

let unlocked = false;

let isHolding = false;

let activePointerId = null;

let pointerStartX = 0;

let pointerStartY = 0;

let pointerStartTime = 0;

let holdActivated = false;

let pauseWasManual = false;

let changingScene = false;

let transitionTimer = null;

let progressFrame = null;


/* =========================================================
   CONSTANTES
========================================================= */

const SCENE_COUNT =
  scenes.length;

const HOLD_THRESHOLD = 180;

const SWIPE_THRESHOLD = 45;

const TRANSITION_DURATION = 450;


/* =========================================================
   FUNÇÕES GERAIS
========================================================= */

function clearProgressFrame() {

  if (
    progressFrame !== null
  ) {

    cancelAnimationFrame(
      progressFrame
    );

    progressFrame = null;

  }

}


function clearTransitionTimer() {

  clearTimeout(
    transitionTimer
  );

}


/* =========================================================
   VÍDEO
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


function playVideo(video) {

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

    promise.catch(() => {

      /*
        Caso o navegador bloqueie
        reprodução com áudio,
        tentamos silenciosamente.
      */

      if (!video.muted) {

        video.muted = true;

        video.play()
          .catch(() => {});

      }

    });

  }

}


/* =========================================================
   PROGRESSO
========================================================= */

function resetProgressBars() {

  progressFills.forEach(
    (fill, index) => {

      fill.style.width = "0%";

      progressSegments[index]
        .classList.remove(
          "is-complete",
          "is-upcoming"
        );

    }
  );

}


function updateProgressBars() {

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

        progressSegments[index]
          .classList.remove(
            "is-upcoming"
          );

      }

      else if (
        index > currentScene
      ) {

        fill.style.width =
          "0%";

        progressSegments[index]
          .classList.add(
            "is-upcoming"
          );

        progressSegments[index]
          .classList.remove(
            "is-complete"
          );

      }

      else {

        progressSegments[index]
          .classList.remove(
            "is-complete",
            "is-upcoming"
          );

      }

    }
  );

}


function animateProgress() {

  const video =
    videos[currentScene];

  const fill =
    progressFills[currentScene];


  if (
    !video ||
    !fill
  ) {

    progressFrame = null;

    return;

  }


  /*
    Barra da cena atual.
  */

  if (
    Number.isFinite(
      video.duration
    ) &&
    video.duration > 0
  ) {

    const ratio =
      Math.min(
        1,
        Math.max(
          0,
          video.currentTime /
            video.duration
        )
      );


    fill.style.width =
      `${ratio * 100}%`;

  }


  progressFrame =
    requestAnimationFrame(
      animateProgress
    );

}


function startProgressAnimation() {

  clearProgressFrame();

  animateProgress();

}


/* =========================================================
   CENAS
========================================================= */

function updateScenesVisibility() {

  scenes.forEach(
    (scene, index) => {

      if (
        index === currentScene
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

}


/* =========================================================
   TRANSIÇÃO
========================================================= */

function resetBlackTransition() {

  blackTransition.classList.remove(
    "active"
  );

}


function fadeToBlack() {

  blackTransition.classList.add(
    "active"
  );

}


/* =========================================================
   PREPARAÇÃO DA CENA
========================================================= */

function prepareScene(index) {

  const video =
    videos[index];

  if (!video) {
    return;
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

  video.removeAttribute(
    "controls"
  );


  /*
    Login sempre silencioso.
  */

  if (index === 0) {

    video.muted = true;

  }


  resetVideo(video);

}


/* =========================================================
   INICIAR CENA
========================================================= */

function startScene(index) {

  const video =
    videos[index];


  if (!video) {
    return;
  }


  changingScene = false;

  clearTransitionTimer();

  resetBlackTransition();

  resetProgressBars();

  updateProgressBars();

  updateScenesVisibility();


  /*
    O vídeo da cena atual começa
    sempre do primeiro frame.
  */

  resetVideo(video);


  /*
    Login:
    autoplay silencioso.

    Demais cenas:
    reprodução normal após
    interação do usuário.
  */

  if (index === 0) {

    video.muted = true;

  } else {

    video.muted = false;

  }


  playVideo(video);

  startProgressAnimation();


  /*
    Pré-carrega o vídeo seguinte.
  */

  preloadNext(index);

}


/* =========================================================
   IR PARA CENA
========================================================= */

function goToScene(
  index,
  options = {}
) {

  const {
    fade = true
  } = options;


  if (
    index < 0 ||
    index >= SCENE_COUNT
  ) {

    return;

  }


  if (
    changingScene
  ) {

    return;

  }


  if (
    !unlocked &&
    index !== 0
  ) {

    return;

  }


  /*
    Não faz nada se já estamos
    na cena solicitada.
  */

  if (
    index === currentScene
  ) {

    return;

  }


  changingScene = true;


  const previousVideo =
    videos[currentScene];


  if (fade) {

    fadeToBlack();

  }


  clearProgressFrame();


  /*
    Para completamente a cena anterior.
  */

  if (previousVideo) {

    previousVideo.pause();

  }


  clearTransitionTimer();


  transitionTimer =
    window.setTimeout(
      () => {

        currentScene =
          index;


        isHolding = false;

        holdActivated = false;

        activePointerId = null;

        pauseWasManual = false;


        startScene(
          currentScene
        );


      },
      fade
        ? TRANSITION_DURATION
        : 0
    );

}


/* =========================================================
   PRÓXIMA CENA
========================================================= */

function nextScene() {

  if (
    currentScene >=
    SCENE_COUNT - 1
  ) {

    /*
      Último Story.
      Não há próximo vídeo.
      Aqui deixamos o último
      Story permanecer na tela.

      O CTA poderá ser adicionado
      posteriormente sem alterar
      a navegação.
    */

    return;

  }


  goToScene(
    currentScene + 1
  );

}


/* =========================================================
   CENA ANTERIOR
========================================================= */

function previousScene() {

  if (
    currentScene <= 1
  ) {

    /*
      Na primeira tela da proposta,
      não voltamos para o login.
    */

    return;

  }


  goToScene(
    currentScene - 1
  );

}


/* =========================================================
   FINAL DO VÍDEO
========================================================= */

function handleVideoEnd() {

  if (
    currentScene >=
    SCENE_COUNT - 1
  ) {

    /*
      Último Story:
      completa a barra e permanece
      nele.
    */

    progressFills[currentScene]
      .style.width = "100%";

    return;

  }


  /*
    Ao terminar um Story,
    avançamos automaticamente.
  */

  nextScene();

}


/* =========================================================
   PRELOAD
========================================================= */

function preloadNext(index) {

  const nextIndex =
    index + 1;


  if (
    nextIndex >=
    SCENE_COUNT
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

function pauseCurrentVideo() {

  const video =
    videos[currentScene];


  if (!video) {
    return;
  }


  if (
    video.paused ||
    video.ended
  ) {

    return;

  }


  video.pause();

  pauseWasManual = true;

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


  playVideo(
    video
  );

  pauseWasManual = false;

}


/* =========================================================
   POINTER DOWN
========================================================= */

function handlePointerDown(
  event
) {

  if (
    !unlocked ||
    currentScene === 0
  ) {

    return;

  }


  /*
    Ignora segundo dedo.
  */

  if (
    activePointerId !== null
  ) {

    return;

  }


  activePointerId =
    event.pointerId;


  pointerStartX =
    event.clientX;


  pointerStartY =
    event.clientY;


  pointerStartTime =
    performance.now();


  isHolding = true;

  holdActivated = false;


  /*
    Só a área central pausa.
  */

  if (
    event.currentTarget ===
    storyPause
  ) {

    pauseCurrentVideo();


    /*
      Não usamos ícone visual.
    */

    holdActivated = true;

  }


  try {

    event.currentTarget
      .setPointerCapture(
        event.pointerId
      );

  } catch (error) {

    // Ignorar

  }


  event.preventDefault();

}


/* =========================================================
   POINTER UP — CENTRO
========================================================= */

function handlePausePointerUp(
  event
) {

  if (
    event.pointerId !==
    activePointerId
  ) {

    return;

  }


  const elapsed =
    performance.now() -
    pointerStartTime;


  /*
    Se estava segurando:
    continua ao soltar.
  */

  if (
    holdActivated
  ) {

    resumeCurrentVideo();

  }


  isHolding = false;

  holdActivated = false;

  activePointerId = null;


  /*
    Uma pressão muito curta
    no centro não faz nada além
    de pausar e continuar.
  */

  void elapsed;


  event.preventDefault();

}


/* =========================================================
   POINTER UP — ESQUERDA / DIREITA
========================================================= */

function handleSidePointerUp(
  event,
  direction
) {

  if (
    event.pointerId !==
    activePointerId
  ) {

    return;

  }


  const deltaX =
    event.clientX -
    pointerStartX;


  const deltaY =
    event.clientY -
    pointerStartY;


  const elapsed =
    performance.now() -
    pointerStartTime;


  isHolding = false;

  activePointerId = null;


  /*
    Se houve um movimento horizontal
    muito grande, ainda interpretamos
    pela direção.
  */

  if (
    Math.abs(deltaX) >
    Math.abs(deltaY) &&
    Math.abs(deltaX) >
    SWIPE_THRESHOLD
  ) {

    if (deltaX < 0) {

      nextScene();

    } else {

      previousScene();

    }


    event.preventDefault();

    return;

  }


  /*
    Toque simples:
    executa a ação lateral.
  */

  if (
    elapsed <
    1000
  ) {

    if (
      direction === "previous"
    ) {

      previousScene();

    } else {

      nextScene();

    }

  }


  event.preventDefault();

}


/* =========================================================
   POINTER CANCEL
========================================================= */

function handlePointerCancel(
  event
) {

  if (
    event.pointerId !==
    activePointerId
  ) {

    return;

  }


  if (
    holdActivated
  ) {

    resumeCurrentVideo();

  }


  isHolding = false;

  holdActivated = false;

  activePointerId = null;


  event.preventDefault();

}


/* =========================================================
   PROGRESS BAR — CLIQUE
========================================================= */

function handleProgressClick(
  event
) {

  if (
    !unlocked
  ) {

    return;

  }


  const segment =
    event.currentTarget;


  const index =
    Number(
      segment.dataset.segment
    );


  if (
    !Number.isInteger(index)
  ) {

    return;

  }


  /*
    Tocar na barra 0 significa
    apenas voltar ao login se o
    usuário estiver desbloqueado?
    
    Não permitimos.
  */

  if (
    index === 0
  ) {

    /*
      O login não faz parte da
      navegação depois da entrada.
    */

    return;

  }


  if (
    index === currentScene
  ) {

    /*
      Se clicar na barra atual,
      não reiniciamos.
    */

    return;

  }


  goToScene(
    index,
    {
      fade: true
    }
  );


  event.preventDefault();

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


  /*
    Depois do login, a barra 1
    passa a ser a primeira barra
    efetiva da experiência.

    A barra do login fica completa.
  */

  if (
    progressFills[0]
  ) {

    progressFills[0]
      .style.width = "100%";

  }


  window.setTimeout(
    () => {

      goToScene(
        1,
        {
          fade: true
        }
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
   LOGIN — LIMPAR ERRO
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
   CONTROLES LATERAIS
========================================================= */

storyPrev.addEventListener(
  "pointerdown",
  handlePointerDown,
  {
    passive: false
  }
);


storyPrev.addEventListener(
  "pointerup",
  event => {

    handleSidePointerUp(
      event,
      "previous"
    );

  },
  {
    passive: false
  }
);


storyPrev.addEventListener(
  "pointercancel",
  handlePointerCancel,
  {
    passive: false
  }
);


storyNext.addEventListener(
  "pointerdown",
  handlePointerDown,
  {
    passive: false
  }
);


storyNext.addEventListener(
  "pointerup",
  event => {

    handleSidePointerUp(
      event,
      "next"
    );

  },
  {
    passive: false
  }
);


storyNext.addEventListener(
  "pointercancel",
  handlePointerCancel,
  {
    passive: false
  }
);


/* =========================================================
   CONTROLE CENTRAL
========================================================= */

storyPause.addEventListener(
  "pointerdown",
  handlePointerDown,
  {
    passive: false
  }
);


storyPause.addEventListener(
  "pointerup",
  handlePausePointerUp,
  {
    passive: false
  }
);


storyPause.addEventListener(
  "pointercancel",
  handlePointerCancel,
  {
    passive: false
  }
);


/* =========================================================
   BARRAS
========================================================= */

progressSegments.forEach(
  segment => {

    segment.addEventListener(
      "pointerup",
      handleProgressClick,
      {
        passive: false
      }
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

        /*
          Só reagimos ao vídeo
          que está realmente ativo.
        */

        if (
          index !== currentScene
        ) {

          return;

        }


        handleVideoEnd();

      }
    );


    video.addEventListener(
      "loadedmetadata",
      () => {

        /*
          Garante que o navegador
          conheça a duração do vídeo.
        */

        if (
          index === currentScene
        ) {

          updateProgressBars();

        }

      }
    );

  }
);


/* =========================================================
   LOGIN VIDEO
========================================================= */

const loginVideo =
  document.getElementById(
    "loginVideo"
  );


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
   CONTEXTO
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
   GESTOS DE ZOOM — IOS
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

  resetProgressBars();

  updateProgressBars();

  prepareScene(0);

  prepareScene(1);

  currentScene = 0;

  unlocked = false;

  updateScenesVisibility();

  resetBlackTransition();

  hideNavigation();


  /*
    Pré-carrega o primeiro Story
    além do login.
  */

  preloadNext(0);


  /*
    Inicia o login.
  */

  const login =
    videos[0];


  if (login) {

    login.muted = true;

    resetVideo(login);

    playVideo(login);

    startProgressAnimation();

  }

}


window.addEventListener(
  "load",
  initialize
);
