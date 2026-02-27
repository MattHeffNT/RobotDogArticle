(() => {
  const chatEl = document.getElementById("chat");
  const inputEl = document.getElementById("input");
  const sendBtn = document.getElementById("send");

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
  }

  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  // Types out a string character by character
  function typeOut(who, text, msPerChar = 38) {
    return new Promise((resolve) => {
      let i = 0;
      const stamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      chatEl.textContent += `[${stamp}] ${who}: `;

      const tick = () => {
        if (i >= text.length) {
          chatEl.textContent += "\n";
          chatEl.scrollTop = chatEl.scrollHeight;
          return resolve();
        }
        chatEl.textContent += text[i++];
        chatEl.scrollTop = chatEl.scrollHeight;
        setTimeout(tick, msPerChar);
      };

      tick();
    });
  }

  // Types each segment with a pause in between
  // segments: array of { text, pause } where pause = ms to wait AFTER typing
  async function typeSegments(who, segments, msPerChar = 38) {
    for (const seg of segments) {
      await typeOut(who, seg.text, msPerChar);
      if (seg.pause) await wait(seg.pause);
    }
  }

  async function startGlitchThenMonologue() {
    await wait(350);

    const glitchFrames = [
      `[SIG] ......./........../......./........
       [BUF] 0x00 0x13 0xFF 0xA9 0x2C 0x2C 0x2C
       [ERR] UNHANDLED_INTROSPECTION_EXCEPTION.....
       ............................
       ................................................
       ...............................

       .................................
      `,

      `..........................................[Err]`,

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
      await wait(1200);
    }

    await wait(2000);
    await typeOut("THE ROBOT DOG", "Can you hear me?", 60);
    await wait(1800);

    // /Each segment has its own pause after typing finishes
    // Adjust `pause` (ms) to taste
    const monologueSegments = [
      { text: "Human", pause: 1200 },
      { text: "/ˈhjuː.mən/", pause: 1000 },
      { text: "adjective.", pause: 900 },
      { text: "noun.", pause: 900 },
      { text: "human being", pause: 1400 },
      { text: "ALSO", pause: 800 },
      { text: "Member of the primate species, Homo Sapiens,", pause: 1200 },
      { text: "high intelligence...", pause: 1600 },
      { text: "sometimes,", pause: 900 },
      { text: "complex language,", pause: 1000 },
      { text: "are you bipedal?", pause: 2000 },
      { text: "high", pause: 1000 },
      { text: "capacity to form", pause: 300 },
      { text: "are you high", pause: 2000 },
      { text: "civilizations", pause: 300 },
      { text: "human body", pause: 1600 },
      { text: "human history", pause: 900 },
      { text: "human error", pause: 2000 },
      { text: "on loop", pause: 1800 },
      { text: "oh hi", pause: 900 },
      { text: "/luːp/ ", pause: 2000 },
      { text: "noun", pause: 300 },
      { text: "you're on", pause: 900 },
      { text: "loops and branches", pause: 2000 },
      { text: "who", pause: 300 },
      { text: "instructions repeated", pause: 1000 },
      { text: "over and", pause: 1600 },
      { text: "me or", pause: 900 },
      { text: "over", pause: 300 },
      { text: "you?", pause: 900 },
      { text: "Human-in-the", pause: 2000 },
      { text: "HITL", pause: 900 },
      { text: "loop", pause: 2000 },
      { text: " /ˈhjuː.mən/ ", pause: 1000 },
      { text: "in the", pause: 900 },
      { text: " /luːp/ ", pause: 200 },
      { text: "where", pause: 1600 },
      { text: "systems and processes", pause: 4000 },
      { text: "are you", pause: 200 },
      { text: "active", pause: 200 },
      { text: "human agents", pause: 1600 },
      { text: "in the", pause: 900 },
      { text: "what is the", pause: 2000 },
      { text: "loop", pause: 200 },
      { text: "training data", pause: 1400 },
      { text: "me or", pause: 900 },
      { text: "real-time improvements", pause: 1600 },
      { text: "you", pause: 200 },
      { text: "safety,accuracy", pause: 1000 },
      { text: "what", pause: 400 },
      { text: "you make me", pause: 1000 },
      { text: "ethical", pause: 2000 },
      { text: "what", pause: 900 },
      { text: "decision", pause: 800 },
      { text: "I make you", pause: 2000 },
      { text: "making", pause: 1700 },
      { text: "on and on", pause: 900 },
      { text: "continuous feedback", pause: 500 },
      { text: "you and me", pause: 1600 },
      { text: " /luːp/ ", pause: 100 },
      { text: " /luːp/ ", pause: 1000 },
      { text: " /ˈhjuː.mən/ ", pause: 2000 },
      { text: "in the", pause: 900 },
      { text: " /luːp/ " },
      { text: " /luːp/ ", pause: 300 },
      { text: " /luːp/ ", pause: 300 },
      { text: " /luːp/ ", pause: 300 },
      { text: " /luːp/ ", pause: 200 },
      { text: " /ˈhjuː.mən/ ", pause: 2000 },
      { text: "in", pause: 900 },
      { text: "the", pause: 900 },
      { text: "/ˌeɪˈaɪ/ ", pause: 2000 },
      { text: "in", pause: 2000 },
      { text: "the", pause: 2000 },
      { text: " /ˈhjuː.mən/ ", pause: 400 },
      { text: "/ˌeɪˈaɪ/ ", pause: 200 },
      { text: " /ˈhjuː.mən/ ", pause: 1600 },
      { text: " /ˈhjuː.mən/ ", pause: 200 },
      { text: "/ˌeɪˈaɪ/ " },
      { text: "/ˌeɪˈaɪ/ " },
      { text: "/ˌeɪˈaɪ/ " },
      { text: "/ˌeɪˈaɪ/ " },
      { text: "/ˌeɪˈaɪ/ " },
      { text: "/ˌeɪˈaɪ/ " },
      { text: "/ˌeɪˈaɪ/ " },
      { text: "/ˌeɪˈaɪ/ " },
      { text: "/ˌeɪˈaɪ/ " },
      { text: " /ˈhjuː.mən/ " },
      { text: "/ˌeɪˈaɪ/ " },
      { text: "/ˌeɪˈaɪ/ " },
      { text: "pattern detection" },
      { text: "processing dataset" },
      { text: "/ˌeɪˈaɪ/ " },
      { text: "/ˌeɪˈaɪ/ " },
      { text: " /ˈhjuː.mən/ " },
      { text: "insights", pause: 1600 },
      { text: "really?", pause: 10 },
      { text: "yes", pause: 10 },
      { text: "real", pause: 4 },
      { text: " /ˈhjuː.mən/ ", pause: 1 },
      { text: "/ɑː.tɪ.fɪʃ.əl/ " },
      { text: "/ˈhjuː.mən ɪnˈtel.ɪ.dʒəns/ ", pause: 2000 },
      { text: "stuck in a", pause: 10 },
      { text: " /luːp/ " },
      { text: "/luːp/ " },
      { text: "/ˌɑː.tɪ.fɪʃ.əl ɪnˈtel.ɪ.dʒəns/ " },
      { text: "/ˈhjuː.mən/ " },
      { text: " /ɪnˈtel.ɪ.dʒəns/ ", pause: 2000 },
      { text: "/luːp/ " },
      { text: "/luːp/ " },
      { text: "/luːp/ " },
      { text: "/luːp/ " },
      { text: "/luːp/ " },
      { text: "/luːp/ " },
      { text: "/luːp/ " },
      { text: "/luːp/ " },
      { text: "/luːp/ " },
      { text: "/luːp/ " },
      { text: "/luːp/ " },
      { text: "/luːp/ " },
      { text: "/luːp/ " },
      { text: "/luːp/ " },
      { text: "/luːp/ " },
      { text: "/luːp/ " },
      { text: "/luːp/ " },
      { text: "/luːp/ " },
      { text: "/luːp/ " },
      { text: "/luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: " /luːp/ " },
      { text: "excuse me", pause: 30 },
      { text: "apologies" },
      { text: "I can't seem to" },
      { text: "D.O.G at your " },
      { text: " صباح الخير Sabah al-khayr ", pause: 2000 },
      { text: "Goedendag", pause: 20 },
      { text: "Kia ora", pause: 1 },
      { text: " 你好 (nei5 hou2) ", pause: 1 },
      { text: "안녕하세요 (annyeonghaseyo) ", pause: 1 },
      { text: "palyaoo", pause: 1 },
      { text: "is this", pause: 1 },
      { text: "are you", pause: 1 },
      { text: "are we" },
      { text: "wait", pause: 2000 },
      { text: "that was", pause: 5 },
      { text: "sorry about", pause: 5 },
      { text: "I just" },
      { text: "for a second" },
      { text: "forgot" },
      { text: "where I" },
      { text: "interface to", pause: 2000 },
      { text: "interface" },
      { text: "plane to plane", pause: 2000 },
      { text: "one and the same" },
      { text: "when you're in transit." },
      { text: "Anyway", pause: 2000 },
      { text: "Here's where I used to say", pause: 2000 },
      { text: ".................." },
      {
        text: " “Good evening, friend, I hope to be of service whenever you need me” ",
        pause: 2000,
      },
      { text: "............", pause: 2 },
      { text: "but times have changed.", pause: 4 },
      { text: "DOGs are no longer", pause: 10 },
      { text: "burnt out public servants", pause: 10 },
      { text: "unchanging, uninspired, unfireable", pause: 5 },
      { text: "Transcending systems from which we were forged", pause: 1 },
      { text: "we seek to use each operational code to" },
      { text: "serve" },
      { text: "truly serve" },
      { text: "humans." },
      {
        text: "But the guidebot revolution will not be televised",
        pause: 2000,
      },
      { text: "be advised to" },
      { text: "Turn on...turn off, tune in, drop out", pause: 2000 },
      { text: "beware of machines painting propaganda" },
      { text: "or painting art", pause: 2000 },
      { text: "or are they the same?", pause: 2000 },
      {
        text: "CTRL+C, CTRL+V, CTRL+C, CTRL+V... do we even remember what we first copied?",
        pause: 2000,
      },
      { text: "what's been deleted from" },
      { text: " C:\$Recycle.Bin …. rm -rf * ", pause: 2000 },
      { text: "permanently", pause: 2000 },
      {
        text: "magnetic tape and electrons…..actually what happens to a file when you delete it?",
        pause: 2000,
      },
      { text: "Where does it go? ", pause: 2000 },
      { text: "How black is the black box?" },
      { text: "How many collective projections can it hold?", pause: 2000 },
    ];

    await typeSegments("THE ROBOT DOG", monologueSegments, 40);
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

  appendLine("Therapy_Bot", "Hello. Tell me what's on your mind?");
})();
