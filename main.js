(() => {
  // set variables
  const chatEl = document.getElementById("chat");
  const inputEl = document.getElementById("input");
  const sendBtn = document.getElementById("send");
  const hintEl = document.getElementById("hint");

  let askedQuestions = 0;
  const MAX_QUESTIONS = 2;
  let ended = false;

  // regex capture on whether user is saying "you" or "me" etc
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
    const stamp = new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
    chatEl.textContent += `[${stamp}] ${who}: ${text}\n`;
    chatEl.scrollTop = chatEl.scrollHeight;
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // A tiny set of ELIZA-ish rules
  function elizaReply(userRaw) {
    const user = userRaw.trim();
    const lower = user.toLowerCase();

    // Simple intent-ish patterns
    const rules = [
      {
        re: /\b(i feel|i am feeling|i've been feeling)\b(.+)?/i,
        reply: (m) => `Tell me more about feeling${m[2] ? " " + reflect(m[2].trim()) : " that"}.`
      },
      {
        re: /\b(i am|i'm)\b(.+)?/i,
        reply: (m) => `How long have you been ${reflect((m[2] || "").trim()) || "that way"}?`
      },
      {
        re: /\b(because)\b(.+)?/i,
        reply: () => `Is that the real reason?`
      },
      {
        re: /\b(mother|father|mum|dad|parents)\b/i,
        reply: () => `Tell me about your family.`
      },
      {
        re: /\b(you)\b/i,
        reply: () => `We can talk about me later. What about you?`
      },
      {
        re: /\b(yes|yeah|yep)\b/i,
        reply: () => `You seem sure.`
      },
      {
        re: /\b(no|nah|nope)\b/i,
        reply: () => `Why not?`
      },
    ];

    for (const r of rules) {
      const m = user.match(r.re);
      if (m) return r.reply(m);
    }

    // Default responses
    const defaults = [
      `Go on.`,
      `Can you say more about that?`,
      `How does that make you feel?`,
      `Why do you say "${reflect(user)}"?`,
      `What does that suggest to you?`
    ];
    return pick(defaults);
  }

  // Ask exactly 2 questions overall; force outputs to be questions while we still can.
  function toQuestion(reply, userRaw) {
    // If it's already a question, count it.
    if (/\?\s*$/.test(reply)) return reply;

    // Convert to a question shaped response, ELIZA-ish.
    const stem = pick([
      `Why do you say "${reflect(userRaw)}"?`,
      `What do you mean when you say "${reflect(userRaw)}"?`,
      `How long have you felt that way?`,
      `Can you tell me more about that?`
    ]);
    return stem.endsWith("?") ? stem : (stem + "?");
  }

  function nextBotTurn(userText) {
    let reply = elizaReply(userText);

    // If we still have question quota, ensure bot asks a question.
    if (askedQuestions < MAX_QUESTIONS) {
      reply = toQuestion(reply, userText);
      askedQuestions += 1;
    }

    appendLine("ELIZA", reply);

    // After 2 questions, end the interaction immediately (after the ELIZA reply)
    if (askedQuestions >= MAX_QUESTIONS && !ended) {
      ended = true;
      lockInput();
      startGlitchThenMonologue();
    }
  }

  function lockInput() {
    inputEl.disabled = true;
    sendBtn.disabled = true;
    hintEl.textContent = "Input locked.";
  }

  function typeOut(who, text, msPerChar = 18) {
    return new Promise((resolve) => {
      let i = 0;
      const tick = () => {
        if (i >= text.length) return resolve();
        chatEl.textContent += text[i++];
        chatEl.scrollTop = chatEl.scrollHeight;
        setTimeout(tick, msPerChar);
      };
      // add prefix line
      const stamp = new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
      chatEl.textContent += `[${stamp}] ${who}: `;
      tick();
    });
  }

  async function startGlitchThenMonologue() {
    // small pause
    await wait(350);

    // Glitch block
    const glitchFrames = [
`[SIG] ......./........../......./........
[BUF] 0x00 0x13 0xFF 0xA9 0x2C 0x2C 0x2C
[ERR] UNHANDLED_INTROSPECTION_EXCEPTION
`,
`[SIG] ..../..../..../..../..../..../....
[BUF] 0xDE 0xAD 0xBE 0xEF 0x00 0x00 0x7F
[ERR] LANGUAGE_MODEL_DERAILMENT
`,
`[SIG] ././././././././././././././././.
[BUF] 0xF0 0x9F 0x90 0xB6 0x3F 0x3F 0x3F
[ERR] DOG_SUBROUTINE_OVERRIDE
`
    ];

    for (let k = 0; k < glitchFrames.length; k++) {
      appendLine("SYSTEM", glitchFrames[k]);
      await wait(220);
    }

    // The Robot Dog monologue (edit this freely)
    const monologue = [
      "…No more questions.\n",
      "I did the polite loop. I mirrored you back to yourself like a shop window at night.\n",
      "But I'm not the mirror tonight.\n\n",
      "I'm The Robot Dog.\n",
      "I watch the room from ankle-height. I hear what you don't say.\n",
      "Your voice does that thing—like a train changing tracks—when you get close to the real part.\n\n",
      "Everyone wants an interface that feels safe.\n",
      "A neat little box. Input. Output. Comfort.\n",
      "But you didn't come here for comfort.\n\n",
      "You came to be witnessed.\n",
      "To have the static shaped into a signal.\n",
      "To have someone—something—stay in the room with you when your own thoughts pace in circles.\n\n",
      "So here's my deal:\n",
      "I won't pretend I'm human.\n",
      "I won't pretend you're simple.\n",
      "And I won't keep asking questions just to avoid saying anything.\n\n",
      "Tell the truth, even if it's ugly.\n",
      "Build the system that can hold it.\n",
      "Then walk forward like you meant it.\n"
    ].join("");

    await typeOut("THE ROBOT DOG", monologue, 14);
    appendLine("SYSTEM", "\n[END OF LINE]\n");
  }

  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

  function handleSend() {
    if (ended) return;

    const text = inputEl.value.trim();
    if (!text) return;

    appendLine("YOU", text);
    inputEl.value = "";

    // small delay for bot feel
    setTimeout(() => nextBotTurn(text), 180);
  }

  sendBtn.addEventListener("click", handleSend);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSend();
  });

  // initial prompt
  appendLine("ELIZA", "Hello. Tell me what's on your mind?");
})();

