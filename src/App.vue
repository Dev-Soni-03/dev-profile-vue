<template>
  <div class="app-root">
    <a href="#maincontent" class="skip">Skip to content</a>

    <!-- Top bar (permanent dark) -->
    <header class="topbar" role="banner">
      <div class="id">
        <div class="avatar ring">
          <img v-if="photoOk && photoSrc" :src="photoSrc" alt="Dev Soni" class="avatar-img" loading="lazy" decoding="async" @error="photoOk=false" />
          <span v-else>{{ initials(profile.name) }}</span>
        </div>
        <div class="who">
          <div class="name">{{ profile.name }}</div>
          <div class="role">
            <span>{{ profile.title }}</span>
            <span class="dot">•</span>
            <span class="rotate">{{ rotatingTagline }}</span>
          </div>
        </div>
      </div>

      <!-- Desktop nav -->
      <nav class="primary-nav" aria-label="Primary">
        <button
          v-for="t in tabs"
          :key="t"
          :aria-current="activeTab === t ? 'page' : false"
          :class="['nav-link', { active: activeTab === t }]"
          @click="setTab(t)"
        >{{ t }}</button>
      </nav>

      <div class="actions">
        
        <button class="icon" title="Print / Save as PDF" @click="printProfile" aria-label="Print or save as PDF">🖨️</button>
        <button class="icon" title="Share profile" @click="shareProfile" aria-label="Share profile">🔗</button>
      </div>
    </header>
    <div class="topbar-underline" aria-hidden="true"></div>

    <!-- Hero -->
    <section class="container hero card fade-in" aria-labelledby="home-title">
      <div class="hero-text">
        <h1 id="home-title" class="headline">{{ profile.name }}</h1>
        <p class="subtitle">{{ profile.title }}</p>
        <p class="summary">
          I turn ideas into fast, reliable software with a focus on clean architecture and friendly UX. I document as I build, automate repetitive work, and help teams ship with confidence.
        </p>
        <div class="quick-actions">
          <button class="btn primary" @click="openMail()">✉️ Contact Me</button>
          <button class="btn" @click="copyToClipboard(profile.email, 'Email copied')">📋 Copy Email</button>
          <button class="btn" @click="copyToClipboard(profile.phone, 'Phone copied')">📞 {{ profile.phone }}</button>
          
          <span v-if="copied" class="copied" role="status">✔ {{ copied }}</span>
        </div>
      </div>
      <div class="hero-avatar">
        <div class="portrait glow">
          <img v-if="photoOk && photoSrc" :src="photoSrc" alt="Dev Soni" class="portrait-img" loading="eager" decoding="async" fetchpriority="high" @error="photoOk=false" />
          <span v-else>{{ initials(profile.name) }}</span>
        </div>
        <div class="check" aria-hidden="true">✔</div>
      </div>
    </section>

    <!-- Content -->
    <main id="maincontent" class="container content" role="main">
      <Transition name="fade" mode="out-in">
        <div :key="activeTab">
          <!-- About -->
          <section v-if="activeTab === 'About'" aria-labelledby="about-title">
            <InfoCard>
              <template #title>
                <span id="about-title">About Me</span>
              </template>
              <ul class="kv">
                <li><strong>Location:</strong> <span>London, Ontario</span></li>
                <li><strong>Email:</strong> <span>{{ profile.email }}</span></li>
                <li><strong>Phone:</strong> <span>{{ profile.phone }}</span></li>
              </ul>
              <p class="mt">
                I like building useful tools, improving developer experience, and crafting UIs that feel effortless. My loop: scope → sketch → ship → measure → iterate.
              </p>
            </InfoCard>
            <InfoCard>
              <template #title>Highlights</template>
              <div class="badges">
                <span class="badge">⚡ Rapid Prototyping</span>
                <span class="badge">🧪 Test‑First Mindset</span>
                <span class="badge">📦 Clean Architecture</span>
                <span class="badge">🛠️ Tooling & DX</span>
                <span class="badge">🤝 Mentoring</span>
              </div>
            </InfoCard>
          </section>

          <!-- Skills -->
          <section v-else-if="activeTab === 'Skills'" aria-labelledby="skills-title">
            <h2 id="skills-title" class="visually-hidden">Skills</h2>
            <div class="filters">
              <input class="search" v-model="skillQuery" placeholder="Search skills..." aria-label="Search skills" />
              <div class="chips" role="tablist" aria-label="Skill category">
                <button v-for="k in ['All','Soft','Hard']" :key="k" :class="['chip', { active: skillsFilter === k }]" @click="skillsFilter = k">{{ k }}</button>
              </div>
            </div>
            <div class="grid">
              <div v-for="(s, idx) in filteredSkills" :key="s.value + idx" class="pill fade-in" :style="{ animationDelay: (idx * 40) + 'ms' }">
                <span class="pill-text">{{ s.value }}</span>
                <span class="pill-kind">{{ s.kind }}</span>
              </div>
            </div>
          </section>

          <!-- Experience -->
          <section v-else-if="activeTab === 'Experience'" aria-labelledby="exp-title">
            <h2 id="exp-title" class="visually-hidden">Experience</h2>
            <div class="stack">
              <details v-for="(exp, i) in profile.experience" :key="i" class="card fade-in" :style="{ animationDelay: (i * 60) + 'ms' }" :open="i===0">
                <summary class="row">
                  <div class="title">{{ exp.role }}</div>
                  <div class="muted">{{ exp.company }} — {{ exp.start }} – {{ exp.end }}</div>
                </summary>
                <ul class="bullets">
                  <li v-for="(p, idx) in exp.points" :key="idx">{{ p }}</li>
                </ul>
              </details>
            </div>
          </section>

          <!-- Projects -->
          <section v-else-if="activeTab === 'Projects'" aria-labelledby="proj-title">
            <h2 id="proj-title" class="visually-hidden">Projects</h2>
            <div class="grid proj-grid">
              <article v-for="(p, i) in projects" :key="i" class="proj-card fade-in" :style="{ animationDelay: (i * 70) + 'ms' }">
                <header class="proj-head">
                  <div class="proj-title">{{ p.name }}</div>
                  <span class="proj-tag" :title="p.stack">{{ p.stack }}</span>
                </header>
                <p class="muted">{{ p.desc }}</p>
                <div class="proj-actions">
                  <button class="btn" @click="toggleLike(i)">{{ p.liked ? '❤️ Liked' : '🤍 Like' }}</button>
                  <button class="btn" @click="copyToClipboard(p.repo, 'Repo copied')">📋 Copy Repo</button>
                </div>
              </article>
            </div>
          </section>

          <!-- Education (timeline) -->
          <section v-else-if="activeTab === 'Education'" aria-labelledby="edu-title">
            <h2 id="edu-title" class="visually-hidden">Education</h2>
            <section class="timeline">
              <div v-for="(edu, i) in education" :key="i" class="t-item">
                <div class="t-dot" aria-hidden="true"></div>
                <article class="t-card card">
                  <header class="t-head">
                    <div class="t-title">{{ edu.credential }}</div>
                    <div class="t-period">{{ edu.period }}</div>
                  </header>
                  <div class="t-school">{{ edu.school }}</div>
                  <p v-if="edu.notes" class="muted">{{ edu.notes }}</p>
                </article>
              </div>
            </section>
          </section>

          <!-- Contact -->
          <section v-else-if="activeTab === 'Contact'" aria-labelledby="contact-title">
            <h2 id="contact-title" class="visually-hidden">Contact</h2>
            <ContactForm :email="profile.email" @copied="(label) => (copied = label)" />
          </section>
        </div>
      </Transition>
    </main>

    <!-- Mobile dock navigation -->
    <nav class="mobile-dock" aria-label="Mobile navigation">
      <button v-for="t in tabs" :key="t" :class="['dock-btn', { active: activeTab === t }]" :aria-current="activeTab === t ? 'page' : false" @click="setTab(t)">
        <span class="dock-icon" aria-hidden="true">{{ dockIcon(t) }}</span>
        <span class="dock-label">{{ t }}</span>
      </button>
    </nav>

    <!-- Footer -->
    <footer class="container footer" role="contentinfo">
      <div class="card">
        <div class="footer-row">
          <div class="muted">© Dev Soni</div>
          <div class="footer-links">
            <a class="btn link" :href="`mailto:${profile.email}`">✉️ Email ↗</a>
            <a class="btn link" :href="`tel:${profile.phone.replace(/[^\\d+]/g, '')}`">📞 Call ↗</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Permanent dark theme + accent color
const accent = ref(localStorage.getItem('dev-accent') || '#7c5cff')
const activeTab = ref('About')
const copied = ref('')
const skillsFilter = ref('All')
const skillQuery = ref('')
const photoOk = ref(true)

const taglines = [
  'Build • Measure • Learn',
  'From idea to deploy',
  'Clean code, clear UX',
  'Automate the boring stuff'
]
const rotatingTagline = ref(taglines[0])

const profile = ref({
  name: 'Dev Soni',
  title: 'Computer Programming & Analysis Student',
  email: 'sonidev269@gmail.com',
  phone: '(437) 971-0310',
  photo: 'dev profile.jpg', // place this file under /public (exact name)
  skills: {
    soft: [ 'Team collaboration and adaptability', 'Time management and multitasking', 'Strong communication and customer service' ],
    hard: [ 'C#','Java','HTML/CSS','SQL','Git','Visual Studio','MySQL','Database design','System troubleshooting' ]
  },
  experience: [
    { company: 'Walmart Canada – London, ON', role: 'Overnight Associate', start: 'Aug 2024', end: 'Present', points: [ 'Restock shelves, manage inventory, and ensure department cleanliness overnight.', 'Support team operations under tight deadlines with minimal supervision.', 'Communicate effectively with supervisors and team members to resolve issues.' ] },
    { company: 'Shell – London, ON', role: 'Cashier', start: 'Oct 2023', end: 'Aug 2024', points: [ 'Provided excellent customer service and handled transactions.', 'Performed store maintenance and inventory checks.', 'Resolved customer inquiries and supported basic system troubleshooting.' ] }
  ]
})

const education = ref([
  { school: 'Fanshawe College – London, ON', credential: 'Advanced Diploma in Computer Programming and Analysis', period: '2024 – 2027 (In Progress)', notes: 'Focus on full‑stack development, databases, and software design.' },
  { school: 'L J Polytechnic, Ahmedabad, India', credential: 'Diploma in Computer Engineering', period: 'Completed', notes: 'Core CS fundamentals and practical engineering labs.' },
  { school: 'Meta Front‑End Developer (Coursera)', credential: 'Professional Certificate', period: 'Completed', notes: 'Front‑end foundations: HTML, CSS, JS, React, version control.' }
])

const projects = ref([
  { name: 'CaseStudy Shop', stack: 'Vue + .NET API', liked: false, repo: 'github.com/devsoni/casestudy-shop', desc: 'E‑commerce demo with JWT auth, cart, orders, and SQL back end.' },
  { name: 'Global Economies', stack: 'C# + XML/XPath', liked: false, repo: 'github.com/devsoni/global-economies', desc: 'XML analytics with XPath queries and export utilities.' },
  { name: 'HorseRace Threads', stack: 'Java', liked: false, repo: 'github.com/devsoni/horse-race', desc: 'Multithreaded console race simulation with thread pool.' }
])

onMounted(() => {
  document.documentElement.classList.add('dark') // permanent dark
  applyAccent()
  // Rotating tagline
  let i = 0
  setInterval(() => { i = (i+1) % taglines.length; rotatingTagline.value = taglines[i] }, 2400)
})

function applyAccent(){
  const val = accent.value
  localStorage.setItem('dev-accent', val)
  document.documentElement.style.setProperty('--accent', val)
}

const tabs = ['About', 'Skills', 'Experience', 'Projects', 'Education', 'Contact']

const filteredSkills = computed(() => {
  const q = skillQuery.value.trim().toLowerCase()
  const list = skillsFilter.value === 'Soft' ? profile.value.skills.soft.map(x=>({kind:'Soft', value:x}))
             : skillsFilter.value === 'Hard' ? profile.value.skills.hard.map(x=>({kind:'Hard', value:x}))
             : [ ...profile.value.skills.soft.map(x=>({kind:'Soft', value:x})), ...profile.value.skills.hard.map(x=>({kind:'Hard', value:x})) ]
  return q ? list.filter(s => s.value.toLowerCase().includes(q)) : list
})

const photoSrc = computed(() => profile.value.photo ? (import.meta.env.BASE_URL + encodeURI(profile.value.photo)) : '')

function setTab(t){
  activeTab.value = t
  // ensure content is in view on mobile when switching
  const el = document.getElementById('maincontent')
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// General actions
function openMail(subject = 'Hello Dev', body = 'Hi Dev, '){ const u = new URL(`mailto:${profile.value.email}`); u.searchParams.set('subject',subject); u.searchParams.set('body', body); window.location.href = u.toString() }
async function copyToClipboard(text, label){ try { await navigator.clipboard.writeText(text); copied.value = label; setTimeout(()=>copied.value='', 2000) } catch(e){ console.error(e) } }
function printProfile(){ window.print() }
function shareProfile(){ const data = { title: `${profile.value.name} – Profile`, text: `Connect with ${profile.value.name} (${profile.value.title})`, url: window.location.href }; if (navigator.share) navigator.share(data).catch(console.error); else copyToClipboard(window.location.href, 'Link copied') }
function toggleLike(i){ projects.value[i].liked = !projects.value[i].liked }
function initials(name){ return name.split(' ').filter(Boolean).map(n=>n[0]).slice(0,2).join('') }

function dockIcon(label){
  switch(label){
    case 'About': return '🏠'
    case 'Skills': return '🧰'
    case 'Experience': return '💼'
    case 'Projects': return '📦'
    case 'Education': return '🎓'
    case 'Contact': return '✉️'
    default: return '•'
  }
}
</script>

<script>
export default {
  components: {
    InfoCard: {
      template: `
        <div class="card">
          <div class="card-title"><slot name="title">Section</slot></div>
          <div><slot /></div>
        </div>
      `
    },
    ContactForm: {
      emits: ['copied'],
      props: ['email'],
      data: () => ({ subject: 'Hello Dev', body: 'Hi Dev,\n\nI came across your profile and would love to connect!' }),
      methods: {
        handleSend(e){ e.preventDefault(); const u = new URL(`mailto:${this.email}`); u.searchParams.set('subject', this.subject); u.searchParams.set('body', this.body); window.location.href = u.toString() },
        copyDraft(){ const draft = `Subject: ${this.subject}\n\n${this.body}`; navigator.clipboard.writeText(draft).then(()=> this.$emit('copied','Draft copied')) }
      },
      template: `
        <form @submit="handleSend" class="form">
          <label class="label">Subject
            <input v-model="subject" class="input" />
          </label>
          <label class="label">Message
            <textarea v-model="body" rows="6" class="textarea"></textarea>
          </label>
          <div class="btn-row">
            <button type="submit" class="btn primary">✉️ Send via Email</button>
            <button type="button" @click="copyDraft" class="btn">📋 Copy Draft</button>
            <button type="button" @click="() => window.print()" class="btn">🖨️ Print this Page</button>
          </div>
        </form>
      `
    }
  }
}
</script>

<style>
/* Permanent dark theme */
:root{ --bg:#0b1220; --bg2:#0f172a; --text:#e6edf7; --muted:#94a3b8; --border:#1f2a44; --accent:#6e56cf; --accent-contrast:#fff }
html,body,#app{ min-height:100% }
body{
  margin:0;
  /* solid fallback */
  background:#0a0f1d;
  color:var(--text);
  font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif
}
/* Full-viewport gradient layer to avoid cut-off on tall pages */
body::before{
  content:"";
  position:fixed;
  inset:-20% -10%;
  z-index:-1;
  pointer-events:none;
  background:
    radial-gradient(1000px 520px at 10% -20%, color-mix(in oklab, var(--accent) 14%, transparent) 0%, transparent 60%),
    radial-gradient(900px 420px at 110% 120%, color-mix(in oklab, var(--accent) 10%, transparent) 0%, transparent 60%),
    linear-gradient(180deg, var(--bg) 0%, #0a0f1d 100%);
  background-attachment: fixed;
  transform: translateZ(0);
}

/* Accessibility helpers */
.skip{ position:absolute; left:-9999px; top:auto; width:1px; height:1px; overflow:hidden }
.skip:focus{ left:12px; top:12px; width:auto; height:auto; background:var(--accent); color:var(--accent-contrast); padding:8px 10px; border-radius:8px; z-index:9999 }
.visually-hidden{ position:absolute; left:-9999px }

.app-root{ min-height:100svh; display:flex; flex-direction:column; padding-bottom: calc(72px + env(safe-area-inset-bottom)) }
.container{ max-width: min(1200px, 92vw); margin:0 auto; padding: 0 clamp(12px, 4vw, 32px) }

/* Top bar */
.topbar{ position:sticky; top:0; z-index:40; backdrop-filter: blur(8px); background: color-mix(in oklab, var(--bg2) 75%, transparent); border-bottom:1px solid var(--border); display:grid; grid-template-columns: auto 1fr auto; align-items:center; gap:12px; padding:12px clamp(12px, 3vw, 24px) }
.primary-nav{ display:none; justify-content:center; gap:8px }
.nav-link{ border:1px solid var(--border); background:var(--bg2); padding:10px 14px; border-radius:10px; font-size:14px; cursor:pointer }
.nav-link.active{ background: var(--accent); color: var(--accent-contrast); border-color: var(--accent) }
.topbar-underline{ height:2px; background: linear-gradient(90deg, color-mix(in oklab, var(--accent) 60%, #0000), transparent); opacity:.8 }
.id{ display:flex; align-items:center; gap:12px }
.avatar{ height:40px; width:40px; display:flex; align-items:center; justify-content:center; border-radius:12px; background:linear-gradient(135deg, var(--accent), color-mix(in oklab, var(--accent) 60%, #a855f7)); color:white; font-weight:700; overflow:hidden }
.avatar-img{ width:100%; height:100%; object-fit:cover; display:block; border-radius:inherit }
.ring{ box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent) 22%, transparent) }
.who .name{ font-weight:800; line-height:1.1 }
.who .role{ font-size:12px; color:var(--muted); display:flex; gap:6px; align-items:center }
.who .dot{ opacity:.4 }
.rotate{ font-style:italic }
.actions{ display:flex; gap:8px; align-items:center }
.icon{ height:44px; width:44px; border-radius:10px; border:1px solid var(--border); background:var(--bg2); cursor:pointer }
.icon:hover{ filter: brightness(1.08) }


/* Cards */
.card{ background: color-mix(in oklab, var(--bg2) 96%, transparent); border:1px solid var(--border); border-radius:16px; padding:clamp(16px, 2vw, 24px); box-shadow: 0 10px 30px rgba(2,6,23,.35), inset 0 1px 0 rgba(255,255,255,0.02); margin: 20px 0 }
.card-title{ font-weight:800; margin-bottom:10px }

/* Hero */
.hero{ display:grid; grid-template-columns:1.2fr .8fr; gap: clamp(16px, 3.5vw, 28px); align-items:center }
.headline{ font-size: clamp(24px, 2.2vw + 14px, 46px); font-weight:900; margin:0 }
.subtitle{ margin:4px 0 0 0; color:var(--muted); font-size:14px }
.summary{ margin:16px 0; line-height:1.7; font-size: clamp(14px, 1.1vw + 10px, 18px) }
.quick-actions{ display:flex; flex-wrap:wrap; gap:10px; align-items:center }
.portrait{ height:clamp(84px, 8vw + 60px, 128px); width:clamp(84px, 8vw + 60px, 128px); border-radius:16px; background:linear-gradient(135deg, var(--accent), color-mix(in oklab, var(--accent) 60%, #a855f7)); color:#fff; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:800; position:relative; overflow:hidden }
.portrait-img{ width:100%; height:100%; object-fit:cover; display:block; border-radius:inherit }
.glow{ box-shadow:0 0 60px color-mix(in oklab, var(--accent) 36%, transparent) }
.hero-avatar{ position:relative; justify-self:end }
.check{ position:absolute; right:-8px; bottom:-8px; background:var(--bg2); border:1px solid var(--border); border-radius:999px; padding:6px; font-size:14px; box-shadow:0 4px 10px rgba(0,0,0,.5) }

/* Buttons */
.btn{ border:1px solid var(--border); background:var(--bg2); padding:10px 14px; border-radius:10px; font-size:14px; cursor:pointer; color:var(--text); min-height:44px }
.btn:hover{ filter: brightness(1.08) }
.btn.primary{ background: var(--accent); color:var(--accent-contrast); border-color: var(--accent) }
.btn.link{ text-decoration:none; display:inline-flex; align-items:center; gap:6px }
.copied{ color:#10b981; font-size:14px }

/* Lists */
.kv{ list-style:none; padding:0; margin:0 }
.kv li{ display:flex; gap:8px; padding:4px 0 }
.muted{ color:var(--muted); font-size:14px }
.title{ font-weight:800 }
.bullets{ margin:10px 0 0 18px }

/* Skills */
.filters{ display:flex; flex-wrap:wrap; gap:8px; margin-bottom:10px; align-items:center }
.search{ flex:1 1 220px; min-width:220px; border:1px solid var(--border); background:var(--bg2); color:var(--text); padding:10px 12px; border-radius:10px }
.chips{ display:flex; gap:8px; flex-wrap:wrap }
.chip{ border:1px solid var(--border); background:var(--bg2); padding:8px 12px; border-radius:10px; font-size:12px; cursor:pointer }
.chip.active{ background: var(--accent); color: var(--accent-contrast); border-color: var(--accent) }
.grid{ display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap:12px }
.pill{ border:1px solid var(--border); background:var(--bg2); border-radius:12px; padding:12px; display:flex; align-items:center; justify-content:space-between }
.pill-kind{ font-size:10px; color:var(--muted); border:1px solid var(--border); padding:2px 6px; border-radius:999px }

/* Projects */
.proj-grid{ grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)) }
.proj-card{ border:1px solid var(--border); background:var(--bg2); border-radius:14px; padding:14px }
.proj-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:6px }
.proj-title{ font-weight:800 }
.proj-tag{ font-size:12px; color:var(--muted); border:1px solid var(--border); padding:2px 8px; border-radius:999px }
.proj-actions{ display:flex; gap:8px; margin-top:10px }

/* Education timeline */
.timeline{ position:relative; margin: 10px 0 20px 10px }
.timeline:before{ content:""; position:absolute; left:10px; top:0; bottom:0; width:2px; background: color-mix(in oklab, var(--accent) 32%, transparent) }
.t-item{ position:relative; padding-left:28px; margin: 16px 0 }
.t-dot{ position:absolute; left:2px; top:14px; height:10px; width:10px; border-radius:999px; background: var(--accent); box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent) 28%, transparent) }
.t-card{ margin-left: 0 }
.t-head{ display:flex; align-items:center; justify-content:space-between; gap:12px }
.t-title{ font-weight:800 }
.t-period{ font-size:12px; color:var(--muted) }
.t-school{ color:var(--muted); margin-top:4px }

/* Forms */
.form{ display:grid; gap:12px; max-width:700px }
.label{ display:grid; gap:6px; font-size:14px; color:var(--muted) }
.input, .textarea{ padding:10px 12px; border-radius:10px; border:1px solid var(--border); background:var(--bg2); color:var(--text); outline:none }
.input:focus, .textarea:focus{ box-shadow:0 0 0 3px color-mix(in oklab, var(--accent) 25%, transparent) }
.btn-row{ display:flex; flex-wrap:wrap; gap:8px }

/* Mobile Dock */
.mobile-dock{ position:fixed; left:0; right:0; bottom:0; z-index:45; display:grid; grid-template-columns: repeat(6, 1fr); gap:6px; padding: 10px 12px calc(10px + env(safe-area-inset-bottom)); backdrop-filter: blur(10px); background: color-mix(in oklab, var(--bg2) 80%, transparent); border-top:1px solid var(--border) }
.dock-btn{ display:flex; flex-direction:column; align-items:center; gap:4px; padding:8px 6px; border-radius:10px; border:1px solid var(--border); background:var(--bg2); font-size:12px }
.dock-btn.active{ background: var(--accent); color: var(--accent-contrast); border-color: var(--accent) }
.dock-icon{ font-size:16px; line-height:1 }
.dock-label{ font-size:11px }

.content{ flex:1 }

/* Footer */
.footer{ padding-bottom:40px; margin-top:auto }
.footer-row{ display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between }
.footer-links{ display:flex; gap:8px; flex-wrap:wrap }

/* Animations */
@keyframes kf-fade { from { opacity:0; transform: translateY(8px) } to { opacity:1; transform:none } }
.fade-in{ animation: kf-fade .35s ease both }
.fade-enter-active, .fade-leave-active{ transition: opacity .25s ease, transform .25s ease }
.fade-enter-from, .fade-leave-to{ opacity:0; transform: translateY(8px) }

/* Responsive */
@media (min-width: 900px){
  .primary-nav{ display:flex }
  .mobile-dock{ display:none }
}
@media (max-width: 900px){
  .hero{ grid-template-columns: 1fr; }
  .hero-avatar{ justify-self:start }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce){
  .fade-in, .fade-enter-active, .fade-leave-active{ animation: none; transition: none }
}

/* Print styles (resume-friendly) */
@media print{
  .topbar, .topbar-underline, .mobile-dock, .actions, .primary-nav, .btn, .footer{ display:none !important }
  body{ background:#fff; color:#000 }
  .card{ box-shadow:none; border-color:#ccc }
}
/* Mobile polish */
:target{ scroll-margin-top: 76px }
.kv span, .summary, .proj-title, .t-title{ word-break: break-word }

@media (max-width: 480px){
  .topbar{ grid-template-columns: auto auto auto }
  .who .role .rotate, .who .role .dot{ display:none }
  .icon{ height:40px; width:40px }
  
  .avatar{ height:36px; width:36px }
  .headline{ font-size: 26px }
  .summary{ font-size: 15px }
  .hero{ gap:16px }
  .card{ margin: 14px 0; padding: 14px }
  .quick-actions .btn{ width:100%; justify-content:center }
}

@media (max-width: 420px){
  .grid{ grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) }
  .proj-grid{ grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) }
}

</style>
