<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed, type Component } from 'vue'
import ArrowDown from '@lucide/vue/dist/esm/icons/arrow-down.mjs'
import ArrowDownRight from '@lucide/vue/dist/esm/icons/arrow-down-right.mjs'
import ArrowRight from '@lucide/vue/dist/esm/icons/arrow-right.mjs'
import ArrowUpRight from '@lucide/vue/dist/esm/icons/arrow-up-right.mjs'
import BrainCircuit from '@lucide/vue/dist/esm/icons/brain-circuit.mjs'
import BriefcaseBusiness from '@lucide/vue/dist/esm/icons/briefcase-business.mjs'
import Code from '@lucide/vue/dist/esm/icons/code.mjs'
import Database from '@lucide/vue/dist/esm/icons/database.mjs'
import FileText from '@lucide/vue/dist/esm/icons/file-text.mjs'
import Layers2 from '@lucide/vue/dist/esm/icons/layers-2.mjs'
import Mail from '@lucide/vue/dist/esm/icons/mail.mjs'
import Menu from '@lucide/vue/dist/esm/icons/menu.mjs'
import Search from '@lucide/vue/dist/esm/icons/search.mjs'
import Server from '@lucide/vue/dist/esm/icons/server.mjs'
import Sparkles from '@lucide/vue/dist/esm/icons/sparkles.mjs'
import Utensils from '@lucide/vue/dist/esm/icons/utensils.mjs'
import Wrench from '@lucide/vue/dist/esm/icons/wrench.mjs'
import X from '@lucide/vue/dist/esm/icons/x.mjs'
import profile from '../data/profile.json'
import skillGroups from '../data/skills.json'
import projects from '../data/projects.json'
import certificates from '../data/certificates.json'

type Project = {
  id: string
  name: string
  role: string
  status: string
  tags: string[]
  summary: string
  detail: { problem: string; architecture: string; highlights: string[] } | null
  featured: boolean
  isNdaRestricted?: boolean
  order: number
}
type Certificate = { name: string; issuer: string; year: string; image: string; url: string }
type SkillGroup = (typeof skillGroups)[number]
type ContactLink = { label: string; value: string; href: string; icon: Component; external: boolean }

const portfolioProjects = projects as Project[]
const portfolioCertificates = certificates as Certificate[]
const activeProject = ref<Project | null>(null)
const projectDialog = ref<HTMLDialogElement | null>(null)
const mobileMenuOpen = ref(false)
const skillQuery = ref('')
let animationContext: { revert: () => void } | undefined

const primaryProjects = computed(() => portfolioProjects.filter(project => project.order <= 2))
const selectedProjects = computed(() => portfolioProjects.filter(project => project.order > 2))

const filteredSkillGroups = computed(() => {
  const query = skillQuery.value.trim().toLowerCase()
  if (!query) return skillGroups

  return skillGroups
    .map(group => ({ ...group, items: group.items.filter(skill => skill.toLowerCase().includes(query)) }))
    .filter(group => group.items.length > 0)
})

const contactLinks = computed<ContactLink[]>(() => {
  const links: (ContactLink | null)[] = [
    profile.email ? { label: 'Email', value: profile.email, href: `mailto:${profile.email}`, icon: Mail, external: false } : null,
    profile.github ? { label: 'GitHub', value: profile.github.replace(/^https?:\/\//, ''), href: profile.github, icon: Code, external: true } : null,
    profile.linkedin ? { label: 'LinkedIn', value: profile.linkedin.replace(/^https?:\/\//, ''), href: profile.linkedin, icon: ArrowUpRight, external: true } : null,
    profile.resume ? { label: 'Resume', value: 'View resume', href: profile.resume, icon: FileText, external: true } : null
  ]
  return links.filter((link): link is ContactLink => link !== null)
})

const categoryIcons: Record<SkillGroup['id'], Component> = {
  languages: Code,
  frontend: Layers2,
  backend: Server,
  data: BrainCircuit,
  database: Database,
  devops: BriefcaseBusiness,
  tools: Wrench,
  ai: Sparkles
}

function iconForCategory(id: SkillGroup['id']) {
  return categoryIcons[id]
}

function openProject(project: Project) {
  activeProject.value = project
  projectDialog.value?.showModal()
}

function closeProject() {
  projectDialog.value?.close()
  activeProject.value = null
}

function handleDialogClose() {
  activeProject.value = null
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

onMounted(async () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger')
  ])

  gsap.registerPlugin(ScrollTrigger)
  animationContext = gsap.context(() => {
    gsap.from('.hero-entrance', {
      y: 28,
      autoAlpha: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.12,
      delay: 0.1
    })

    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
      gsap.fromTo(element, { y: 24, autoAlpha: 0 }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.65,
        ease: 'power2.out',
        scrollTrigger: { trigger: element, start: 'top 86%', once: true }
      })
    })
  })
})

onBeforeUnmount(() => animationContext?.revert())
</script>

<template>
  <div class="site-shell">
    <a class="skip-link" href="#main">Skip to content</a>

    <header class="site-header">
      <a class="wordmark" href="#top" aria-label="Supacheep Poonsawat, back to top" @click="closeMobileMenu">
        <span class="wordmark-mark">SP</span>
        <span class="wordmark-name">SUPACHEEP<br>POONSAWAT</span>
      </a>

      <nav class="desktop-nav" aria-label="Main navigation">
        <a href="#about">About</a>
        <a href="#skills">Skills</a>
        <a href="#projects">Selected work</a>
        <a href="#certificates">Certificates</a>
      </nav>

      <a class="header-contact" href="#contact">
        <span>Let's talk</span>
        <ArrowUpRight :size="16" :stroke-width="1.8" aria-hidden="true" />
      </a>

      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="mobileMenuOpen"
        aria-controls="mobile-navigation"
        :aria-label="mobileMenuOpen ? 'Close navigation' : 'Open navigation'"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <X v-if="mobileMenuOpen" :size="20" />
        <Menu v-else :size="20" />
      </button>

      <nav v-if="mobileMenuOpen" id="mobile-navigation" class="mobile-nav" aria-label="Mobile navigation">
        <a href="#about" @click="closeMobileMenu">About <ArrowUpRight :size="16" /></a>
        <a href="#skills" @click="closeMobileMenu">Skills <ArrowUpRight :size="16" /></a>
        <a href="#projects" @click="closeMobileMenu">Selected work <ArrowUpRight :size="16" /></a>
        <a href="#certificates" @click="closeMobileMenu">Certificates <ArrowUpRight :size="16" /></a>
        <a href="#contact" @click="closeMobileMenu">Contact <ArrowUpRight :size="16" /></a>
      </nav>
    </header>

    <main id="main">
      <section id="top" class="hero section-wrap" aria-labelledby="hero-title">
        <div class="hero-copy">
          <div class="eyebrow hero-entrance"><span class="live-dot"></span> FULLSTACK DEVELOPER <span class="eyebrow-divider">/</span> COMPUTER SCIENCE</div>
          <h1 id="hero-title" class="hero-title">
            <span class="hero-entrance">Supacheep</span>
            <span class="hero-title-last hero-entrance">Poonsawat<span class="title-period">.</span></span>
          </h1>
          <div class="hero-bottom hero-entrance">
            <p class="hero-description">I turn thoughtful ideas into useful digital products, from the first interface to the systems that keep them moving.</p>
            <div class="hero-actions">
              <a class="button-primary" href="#projects">Explore selected work <ArrowDownRight :size="17" /></a>
              <a class="text-link" href="#contact">Get in touch <ArrowRight :size="15" /></a>
            </div>
          </div>
        </div>

        <div class="hero-art hero-entrance" aria-label="A preview of the Ban62 restaurant queue project">
          <div class="art-topline"><span>01 / FIELD NOTES</span><span>BUILT TO BE USED</span></div>
          <div class="hero-stamp"><span>SP</span><span>PORTFOLIO<br>2026</span></div>
          <div class="queue-window">
            <div class="queue-window-bar">
              <span class="window-dots"><i></i><i></i><i></i></span>
              <span>ban62 / live queue</span>
              <span class="queue-live"><span></span> LIVE</span>
            </div>
            <div class="queue-window-content">
              <div class="queue-caption"><span>YOUR TABLE, WITHOUT THE TICKET</span><Utensils :size="15" /></div>
              <div class="queue-number">#08<span> in line</span></div>
              <div class="queue-track"><span></span></div>
              <div class="queue-foot"><span>Estimated wait</span><strong>~ 12 min</strong></div>
              <div class="queue-orders"><span>ORDERS MOVING</span><span class="queue-order-pill">06 <i></i></span><span class="queue-order-pill">07 <i></i></span><span class="queue-order-pill is-current">08 <i></i></span></div>
            </div>
          </div>
          <div class="art-caption"><span>Ban62 · multi-restaurant ordering</span><span>01 — 02</span></div>
        </div>

        <a class="hero-scroll" href="#about"><span>SCROLL TO EXPLORE</span><ArrowDown :size="14" /></a>
        <div class="hero-index" aria-hidden="true">26<br>°N</div>
      </section>

      <section id="about" class="about-section section-wrap section-pad" aria-labelledby="about-title">
        <div class="section-kicker" data-reveal><span>01</span><span>THE PERSON BEHIND THE PIXELS</span></div>
        <div class="about-grid">
          <h2 id="about-title" class="section-heading" data-reveal>Build with care.<br><span>Think in systems.</span></h2>
          <div class="about-body" data-reveal>
            <p class="about-lead">I'm Keng, a final-year Computer Science student and fullstack developer who enjoys making the complicated feel clear.</p>
            <p>I move between interface, API, and infrastructure: shaping the experience people touch, then building the dependable pieces behind it. Lately, that means Nuxt and TypeScript on the front, .NET and PostgreSQL underneath, and a little Docker to connect the dots.</p>
            <div class="about-meta">
              <div><span>FOCUS</span><strong>Fullstack product development</strong></div>
              <div><span>STUDY</span><strong>{{ profile.study }}</strong></div>
              <div><span>WORKING ACROSS</span><strong>Frontend → Backend</strong></div>
            </div>
          </div>
        </div>
        <div class="about-rule" data-reveal><span>GOOD WORK IS A TEAM SPORT</span><span>OPEN TO WHAT'S NEXT <ArrowUpRight :size="13" /></span></div>
      </section>

      <section id="skills" class="skills-section section-wrap section-pad" aria-labelledby="skills-title">
        <div class="section-kicker" data-reveal><span>02</span><span>TOOLS OF THE TRADE</span></div>
        <div class="section-head-row" data-reveal>
          <h2 id="skills-title" class="section-heading">A broad toolkit,<br><span>used with intent.</span></h2>
          <label class="skill-search">
            <Search :size="17" aria-hidden="true" />
            <span class="visually-hidden">Search technologies and tools</span>
            <input v-model="skillQuery" type="search" placeholder="Find a tool or language" autocomplete="off">
            <kbd>/</kbd>
          </label>
        </div>

        <div class="skill-groups" data-reveal>
          <article v-for="(group, index) in filteredSkillGroups" :key="group.id" class="skill-group">
            <div class="skill-group-heading">
              <span class="skill-group-icon"><component :is="iconForCategory(group.id)" :size="17" :stroke-width="1.7" /></span>
              <div><h3>{{ group.label }}</h3><span class="skill-count">{{ String(group.items.length).padStart(2, '0') }} TOOLS</span></div>
              <span class="skill-group-index">{{ String(index + 1).padStart(2, '0') }}</span>
            </div>
            <ul class="skill-list">
              <li v-for="skill in group.items" :key="skill" class="skill-item">
                <span class="skill-mark" aria-hidden="true">{{ skill.slice(0, 2).replace(/[^a-z0-9]/gi, '').toUpperCase() || '·' }}</span>
                <span>{{ skill }}</span>
              </li>
            </ul>
          </article>
          <p v-if="filteredSkillGroups.length === 0" class="skills-empty">No matches for “{{ skillQuery }}”. Try another search.</p>
        </div>
      </section>

      <section id="projects" class="projects-section section-wrap section-pad" aria-labelledby="projects-title">
        <div class="section-kicker" data-reveal><span>03</span><span>SELECTED WORK · FRONTEND TO FULLSTACK</span></div>
        <div class="section-head-row projects-heading" data-reveal>
          <h2 id="projects-title" class="section-heading">Made for the<br><span>real world.</span></h2>
          <p class="section-side-note">A small selection of things built to solve real problems, with care taken at every layer.</p>
        </div>

        <div class="project-grid">
          <button v-for="(project, index) in primaryProjects" :key="project.id" class="project-card" type="button" :aria-label="`View details for ${project.name}`" data-reveal @click="openProject(project)">
            <div class="project-visual" :class="`project-visual-${project.id}`">
              <template v-if="project.id === 'ban62'">
                <div class="mini-app mini-ban">
                  <div class="mini-app-top"><span class="mini-brand"><i></i> ban62</span><span class="mini-branch">THAI NOODLE · BANGKOK</span><span class="mini-menu-dots">···</span></div>
                  <div class="mini-ban-body">
                    <div class="mini-ban-welcome"><div><span>MONDAY, 14:26</span><strong>Order up.<br>Queue down.</strong></div><span class="mini-plate"><Utensils :size="20" /></span></div>
                    <div class="mini-order-card"><div><span>NOW SERVING</span><strong>07</strong></div><div class="mini-order-divider"></div><div><span>YOUR NUMBER</span><strong class="mini-order-number">08</strong></div><span class="mini-wait">~ 12 min</span></div>
                    <div class="mini-order-row"><span><i class="mini-check"></i> Order confirmed</span><span>#08</span></div>
                    <div class="mini-progress"><i></i><i></i><i></i><i></i><i></i></div>
                    <div class="mini-ban-bottom"><span>Live updates · powered by SignalR</span><span>↗</span></div>
                  </div>
                </div>
                <span class="visual-note">A BETTER WAY TO WAIT</span>
              </template>
              <template v-else>
                <div class="mini-app mini-suvlet">
                  <div class="mini-suvlet-top"><span>SU VLET</span><span class="mini-suvlet-menu">LISTENING ROOM&nbsp;&nbsp; ↗</span></div>
                  <div class="mini-suvlet-main"><div class="vinyl-record"><div><span>s</span></div></div><div class="mini-track-info"><span>NOW SPINNING · 002</span><strong>Slow afternoons</strong><span>Suvlet Radio · Vol. 02</span></div></div>
                  <div class="mini-waveform" aria-hidden="true"><i v-for="bar in 38" :key="bar" :style="{ '--bar': `${16 + ((bar * 29) % 62)}%` }"></i></div>
                  <div class="mini-player"><span>02:18</span><div class="mini-player-track"><i></i></div><span>04:36</span><span class="mini-play">Ⅱ</span></div>
                  <div class="mini-suvlet-foot"><span>CURATED FOR LATE NIGHTS</span><span>WAVEFORM PLAYER · 01 / 03</span></div>
                </div>
                <span class="visual-note">A HOME FOR THE IN-BETWEEN</span>
              </template>
              <span class="project-open"><ArrowUpRight :size="19" /></span>
            </div>
            <div class="project-card-copy">
              <div class="project-card-top"><span>0{{ index + 1 }} / FEATURED</span><span>{{ project.role }}</span></div>
              <div class="project-card-title"><h3>{{ project.name }}</h3><ArrowUpRight :size="20" /></div>
              <p>{{ project.summary }}</p>
              <div class="project-tags"><span v-for="tag in project.tags.slice(0, 5)" :key="tag">{{ tag }}</span><span v-if="project.tags.length > 5" class="tag-more">+{{ project.tags.length - 5 }}</span></div>
            </div>
          </button>
        </div>

        <div class="selected-work-list" data-reveal>
          <div class="selected-list-heading"><span>MORE IN THE NOTEBOOK</span><span>DETAILS SHARED WITH CARE</span></div>
          <button v-for="project in selectedProjects" :key="project.id" class="selected-project-row" type="button" @click="openProject(project)">
            <span class="selected-project-mark">{{ project.name.slice(0, 2).toUpperCase() }}</span>
            <span class="selected-project-name">{{ project.name }}<small>{{ project.role }}</small></span>
            <span class="selected-project-note">{{ project.isNdaRestricted ? 'Some details are confidential' : project.summary }}</span>
            <ArrowUpRight :size="18" />
          </button>
        </div>
      </section>

      <section id="certificates" class="certificates-section section-wrap section-pad" aria-labelledby="certificates-title">
        <div class="section-kicker" data-reveal><span>04</span><span>ALWAYS LEARNING</span></div>
        <div class="certificate-content" data-reveal>
          <div>
            <h2 id="certificates-title" class="section-heading">Learning never<br><span>really ships.</span></h2>
            <p class="section-side-note">The next certificate will find its place here.</p>
          </div>
          <div v-if="portfolioCertificates.length" class="certificate-grid">
            <a v-for="certificate in portfolioCertificates" :key="certificate.name" class="certificate-item" :href="certificate.url || undefined" :target="certificate.url ? '_blank' : undefined" :rel="certificate.url ? 'noreferrer' : undefined">
              <img v-if="certificate.image" :src="certificate.image" :alt="`${certificate.name} certificate`" loading="lazy">
              <div class="certificate-item-copy"><h3>{{ certificate.name }}</h3><span>{{ certificate.issuer }} · {{ certificate.year }}</span></div>
              <ArrowUpRight v-if="certificate.url" :size="17" />
            </a>
          </div>
          <div v-else class="certificate-empty">
            <div class="certificate-empty-mark"><FileText :size="24" :stroke-width="1.5" /></div>
            <div><span>THE WALL IS WAITING</span><p>No certificates added yet.</p></div>
            <span class="certificate-empty-count">— —</span>
          </div>
        </div>
      </section>

      <section id="contact" class="contact-section section-wrap section-pad" aria-labelledby="contact-title">
        <div class="section-kicker" data-reveal><span>05</span><span>THE NEXT GOOD THING</span></div>
        <div class="contact-main" data-reveal>
          <div class="contact-title-wrap">
            <span class="contact-orbit" aria-hidden="true"><span></span><ArrowDownRight :size="22" /></span>
            <h2 id="contact-title" class="contact-title">Have a good<br>problem to <em>solve?</em></h2>
          </div>
          <div class="contact-aside">
            <p>I'm always interested in thoughtful teams, curious ideas, and work that makes someone's day a little easier.</p>
            <a v-if="profile.email" class="contact-email-link" :href="`mailto:${profile.email}`">{{ profile.email }} <ArrowUpRight :size="17" /></a>
            <div v-else class="contact-pending"><span class="live-dot"></span> CONTACT DETAILS COMING SOON</div>
          </div>
        </div>

        <div v-if="contactLinks.length" class="contact-links" data-reveal>
          <a v-for="link in contactLinks" :key="link.label" :href="link.href" :target="link.external ? '_blank' : undefined" :rel="link.external ? 'noreferrer' : undefined">
            <component :is="link.icon" :size="17" :stroke-width="1.7" />
            <span>{{ link.label }}</span>
            <span class="contact-link-value">{{ link.value }}</span>
            <ArrowUpRight :size="16" />
          </a>
        </div>
      </section>
    </main>

    <footer class="site-footer section-wrap">
      <a class="footer-wordmark" href="#top">SP<span>.</span></a>
      <span>DESIGNED & BUILT BY SUPACHEEP POONSAWAT</span>
      <a href="#top">BACK TO TOP <ArrowUpRight :size="13" /></a>
      <span class="footer-year">2026</span>
    </footer>

    <dialog ref="projectDialog" class="project-dialog" aria-labelledby="dialog-title" @close="handleDialogClose" @click.self="closeProject" @keydown.esc="closeProject">
      <template v-if="activeProject">
        <div class="dialog-topline"><span>PROJECT NOTES / {{ activeProject.id.toUpperCase() }}</span><button class="dialog-close" type="button" aria-label="Close project details" @click="closeProject"><X :size="19" /></button></div>
        <div class="dialog-content">
          <span class="dialog-role">{{ activeProject.role }}</span>
          <h2 id="dialog-title">{{ activeProject.name }}<span>.</span></h2>
          <p class="dialog-summary">{{ activeProject.summary }}</p>
          <template v-if="activeProject.isNdaRestricted">
            <div class="nda-note"><span>CONFIDENTIALITY NOTE</span><p>Project details are intentionally limited in respect of the applicable NDA.</p></div>
          </template>
          <template v-else-if="activeProject.detail">
            <div class="dialog-detail-grid">
              <div><span>THE CHALLENGE</span><p>{{ activeProject.detail.problem }}</p></div>
              <div><span>THE BUILD</span><p>{{ activeProject.detail.architecture }}</p></div>
              <div class="dialog-highlights"><span>IN PRACTICE</span><ul><li v-for="highlight in activeProject.detail.highlights" :key="highlight">{{ highlight }}</li></ul></div>
            </div>
          </template>
          <div v-if="activeProject.tags.length" class="dialog-tags"><span v-for="tag in activeProject.tags" :key="tag">{{ tag }}</span></div>
        </div>
        <div class="dialog-footer"><span>SUPACHEEP POONSAWAT · SELECTED WORK</span><button type="button" @click="closeProject">Close <X :size="15" /></button></div>
      </template>
    </dialog>
  </div>
</template>
