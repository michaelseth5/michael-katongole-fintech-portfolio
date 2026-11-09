/* Small, transparent portfolio FAQ assistant. No API keys, tracking, or invented AI responses. */
(() => {
  const root = document.getElementById('mk-portfolio-chat');
  if (!root) return;
  const log = root.querySelector('.mk-chat-conversation');
  const form = root.querySelector('.mk-chat-form');
  const field = form.querySelector('input');
  const chips = root.querySelectorAll('[data-mk-question]');
  const answers = [
    {
      match: /(contact|email|reach|connect|collaborat|hire|opportunit|meeting|book)/i,
      response: "You can contact Michael at MichaelKatongole5@gmail.com, connect on LinkedIn, or explore his GitHub. His contact links are alongside this chat.",
      link: ['Contact details', 'mailto:MichaelKatongole5@gmail.com']
    },
    {
      match: /(project|build|portfolio|demandsync|synapse|pipeline|github)/i,
      response: "Michael builds applications and data systems across finance and software engineering. Featured work includes DemandSync, Synapse Solution, financial-data pipelines, and analytics projects.",
      link: ['Explore projects', '#project-details']
    },
    {
      match: /(skill|stack|language|python|sql|java|react|database|technology|tool)/i,
      response: "His toolkit includes Python, SQL, Java, C++, React, Next.js, PostgreSQL, FastAPI, data engineering tools, and applied ML frameworks.",
      link: ['View skills', '#skills']
    },
    {
      match: /(educat|universit|utd|dallas|northeastern|college|degree|study|studied|school)/i,
      response: "Michael studied Finance and Computer Science at the University of Texas at Dallas and is continuing his Computer Science studies at Northeastern University.",
      link: ['View education', '#education']
    },
    {
      match: /(experience|job|work|career|intern|fidelity|citi|accenture|bloomberg)/i,
      response: "Michael's experience spans digital banking audit and data analytics at Citi, AI/ML engineering fellowships, and an incoming Fidelity Investments data analyst co-op.",
      link: ['View experience', '#experience']
    },
    {
      match: /(lead|community|mentor|colorstack|volunteer|achievement|milestone)/i,
      response: "Michael leads ColorStack UTD and is active in mentorship, student workshops, engineering communities, and professional development.",
      link: ['View milestones', '#achievements']
    },
    {
      match: /(hello|hey|hi|who are you|who is michael|about michael|about me)/i,
      response: "Hi! I'm the interactive portfolio guide for Michael Katongole. You can ask about his experience, projects, skills, education, and how to contact him.",
      link: ['Read more', '#portfolio-intro-grid']
    }
  ];
  function message(role, value, link) {
    const node = document.createElement('div');
    node.className = 'mk-chat-message';
    node.dataset.role = role;
    node.append(document.createTextNode(value));
    if (link) {
      node.append(document.createTextNode(' '));
      const a = document.createElement('a');
      a.textContent = link[0] + ' ↗';
      a.href = link[1];
      if (a.href.startsWith('http')) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      node.append(a);
    }
    log.append(node);
    log.scrollTop = log.scrollHeight;
  }
  function ask(value) {
    const question = String(value || '').trim().slice(0, 300);
    if (!question) return;
    message('visitor', question);
    const found = answers.find(item => item.match.test(question));
    if (found) message('guide', found.response, found.link);
    else message('guide', "I can answer common questions about Michael's work, projects, skills, education, and contact details. Try a topic button below or email Michael directly for anything else.");
    field.value = '';
  }
  form.addEventListener('submit', event => { event.preventDefault(); ask(field.value); });
  chips.forEach(button => button.addEventListener('click', () => ask(button.dataset.mkQuestion)));
})();
