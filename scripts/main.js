(() => {
  // set variables
  const chatEl = document.getElementById("chat");
  const inputEl = document.getElementById("input");
  const sendBtn = document.getElementById("send");
  const hintEl = document.getElementById("hint");

  let askedQuestions = 0;
  const MAX_QUESTIONS = 2;
  let ended = false;

  const reflections = [
    [/\bI am\b/gi, "you are"],
    [/\bI'm\b/gi, "you're"],
    [/\bI\b/gi, "you"],
    [/\bme\b/gi, "you"],
    [/\bmy\b/gi, "your"],
    [/\bmine\b/gi, "yours"],
    [/\byou are\b/gi, "I am"],
    [/\byou're\b/gi, "I'm"],
    [/\byour\b/gi, "my"],
    [/\byours\b/gi, "mine"],
    [/\bam\b/gi, "are"],
  ];

  function reflect(text) {
    let out = text;
    for (const [re, rep] of reflections) out = out.replace(re, rep);
    return out;
  }

  function appendLine(who, text) {
    const stamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    chatEl.textContent += `[${stamp}] ${who}: ${text}\n`;
    chatEl.scrollTop = chatEl.scrollHeight;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function elizaReply(userRaw) {
    const user = userRaw.trim();

    const rules = [
      {
        re: /\b(i feel|i am feeling|i've been feeling)\b(.+)?/i,
        reply: (m) =>
          `Tell me more about feeling${m[2] ? " " + reflect(m[2].trim()) : " that"}.`,
      },
      {
        re: /\b(i am|i'm)\b(.+)?/i,
        reply: (m) =>
          `How long have you been ${reflect((m[2] || "").trim()) || "that way"}?`,
      },
      {
        re: /\b(because)\b(.+)?/i,
        reply: () => `Is that the real reason?`,
      },
      {
        re: /\b(mother|father|mum|dad|parents)\b/i,
        reply: () => `Tell me about your family.`,
      },
      {
        re: /\b(you)\b/i,
        reply: () => `We can talk about me later. What about you?`,
      },
      {
        re: /\b(yes|yeah|yep)\b/i,
        reply: () => `You seem sure.`,
      },
      {
        re: /\b(no|nah|nope)\b/i,
        reply: () => `Why not?`,
      },
    ];

    for (const r of rules) {
      const m = user.match(r.re);
      if (m) return r.reply(m);
    }

    const defaults = [
      `Go on.`,
      `Can you say more about that?`,
      `How does that make you feel?`,
      `Why do you say "${reflect(user)}"?`,
      `What does that suggest to you?`,
    ];
    return pick(defaults);
  }

  function toQuestion(reply, userRaw) {
    if (/\?\s*$/.test(reply)) return reply;

    const stem = pick([
      `Why do you say "${reflect(userRaw)}"?`,
      `What do you mean when you say "${reflect(userRaw)}"?`,
      `How long have you felt that way?`,
      `Can you tell me more about that?`,
    ]);

    return stem.endsWith("?") ? stem : stem + "?";
  }

  function lockInput() {
    inputEl.disabled = true;
    sendBtn.disabled = true;
    hintEl.textContent = "Input locked.";
  }

  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function typeOut(who, text, msPerChar = 18) {
    return new Promise((resolve) => {
      let i = 0;
      const stamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      chatEl.textContent += `[${stamp}] ${who}: `;

      const tick = () => {
        if (i >= text.length) return resolve();
        chatEl.textContent += text[i++];
        chatEl.scrollTop = chatEl.scrollHeight;
        setTimeout(tick, msPerChar);
      };

      tick();
    });
  }

  // this is where it glitches out and we can add Dog text
  async function startGlitchThenMonologue() {
    await wait(350);

    prompt("Hello can you hear me?");

    prompt("is this thing on?");

    const glitchFrames = [
      `[SIG] ......./........../......./........
       [BUF] 0x00 0x13 0xFF 0xA9 0x2C 0x2C 0x2C
       [ERR] UNHANDLED_INTROSPECTION_EXCEPTION`,

      `


⠀⠀⠀⠀⠀⢀⣤⣀⡀⠀⠀⠀⢀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢠⣿⣿⣿⣿⡄⠀⢠⣿⣿⣿⣷⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⠀⢸⣿⣿⣿⣿⡇⠀⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠘⣿⣿⣿⣿⡏⠀⠀⠻⣿⣿⣿⠃⢰⣿⣿⣿⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣼⣿⣿⣶⡀⠈⠙⠛⠋⢀⣀⣀⣀⠈⠛⠁⠀⠸⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⣿⠀⠀⣠⣾⣿⣿⣿⣿⣿⣿⣦⣀⠀⠈⠛⠛⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⢻⣿⣿⣿⣿⠁⢰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠉⠛⠛⠁⠀⣸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⠟⠃⠀⠀⢀⣀⣀⠀⠀⠀⠀⢀⣤⣶⣦⣄⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠸⣿⣿⣿⣿⣿⣿⠿⠉⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⣿⣿⡀⠀⢰⣿⣿⣿⣿⣿⡆⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠈⠙⠛⠛⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⣿⣿⣿⠁⠀⢼⣿⣿⣿⣿⡿⠁⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿⡿⠿⠋⠀⠀⠈⠛⡛⠛⠋⠀⢠⣾⣿⣿⣶⡀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⣶⣿⣿⣿⣿⣿⣦⣄⠀⢸⣿⣿⣿⣿⡗⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡘⢿⣿⣿⠿⠁⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇⠀⠈⣀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⣾⣿⣿⣦⡀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⢰⣿⣿⣿⣿⠃
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣿⣿⣿⣿⣿⡇⠀⢿⣿⣿⠃⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠿⣿⣿⣿⣿⠟⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀
`,

      `'Hello?'[SIG] ..../..../..../..../..../..../....
        [BUF] 0xDE 0xAD 0xBE 0xEF 0x00 0x00 0x7F
        [ERR] LANGUAGE_MODEL_DERAILMENT
`,
      `'Can you hear me [ERROR]'[SIG] ././././././././././././././././.
        [BUF] 0xF0 0x9F 0x90 0xB6 0x3F 0x3F 0x3F
        [ERR] DOG_SUBROUTINE_OVERRIDE`,

      `

⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣄⢀⡀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣿⣿⡿⠀⠀⠀⠀
⠀⠀⠀⠀⣀⣀⣤⠖⠛⠉⠉⠉⠉⠉⠙⠒⠦⣿⣏⣀⠀⠀⠀⠀
⠀⠀⣠⠞⠁⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢵⡄⠀⠀
⠀⢰⣯⠀⠀⢀⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠀⠀⣿⠀⠀
⠀⠈⣇⢀⢠⠇⠀⣶⡶⠄⠀⠀⠀⢠⣶⡶⠀⠀⣸⣀⣼⠟⠀⠀
⠀⠀⠙⠛⠾⡆⠀⠙⠛⠃⠀⠀⠀⠀⠙⠋⠀⠀⣹⠟⠁⠀⠀⠀
⢀⡴⠚⠉⠛⢿⠀⠀⠀⠀⢿⣿⠆⠀⠀⠀⠀⢀⣿⠋⠉⠉⢳⡄
⢾⡀⡄⠀⣄⡼⠻⢧⠤⣤⠤⠤⣤⣠⣦⣾⠶⠞⢿⣤⡄⣠⣀⡷
⠈⠙⠛⠋⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠉⠉⠀
hey you're finally here

`,
    ];

    for (const frame of glitchFrames) {
      appendLine("SYSTEM", frame);
      await wait(450);
    }

    const monologue = [
      "Human\n",
      "/ˈhjuː.mən/\n",
      "adjective.\n\n",
      "noun.\n",
      "human being\n",
      "ALSO\n",
      "Member of the primate species, Homo Sapiens, high intelligence....sometimes, complex language, are you bipedal?\n",
    ].join("");

    await typeOut("THE ROBOT DOG", monologue, 14);
    appendLine("SYSTEM", "\n[END OF LINE]\n");
  }

  function nextBotTurn(userText) {
    let reply = elizaReply(userText);

    if (askedQuestions < MAX_QUESTIONS) {
      reply = toQuestion(reply, userText);
      askedQuestions += 1;
    }

    appendLine("Therapy_Bot", reply);

    if (askedQuestions >= MAX_QUESTIONS && !ended) {
      ended = true;
      lockInput();
      startGlitchThenMonologue();
    }
  }

  function handleSend() {
    if (ended) return;

    const text = inputEl.value.trim();
    if (!text) return;

    appendLine("YOU", text);
    inputEl.value = "";

    setTimeout(() => nextBotTurn(text), 180);
  }

  sendBtn.addEventListener("click", handleSend);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSend();
  });

  // Initial prompt (this does NOT count as one of the 2 questions)
  appendLine("Therapy_Bot", "Hello. Tell me what's on your mind?");
})();
