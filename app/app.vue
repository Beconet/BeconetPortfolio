<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed, type Component } from 'vue'
import ArrowDownRight from '@lucide/vue/dist/esm/icons/arrow-down-right.mjs'
import ArrowRight from '@lucide/vue/dist/esm/icons/arrow-right.mjs'
import ArrowUpRight from '@lucide/vue/dist/esm/icons/arrow-up-right.mjs'
import Code from '@lucide/vue/dist/esm/icons/code.mjs'
import FileText from '@lucide/vue/dist/esm/icons/file-text.mjs'
import Menu from '@lucide/vue/dist/esm/icons/menu.mjs'
import Search from '@lucide/vue/dist/esm/icons/search.mjs'
import Utensils from '@lucide/vue/dist/esm/icons/utensils.mjs'
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
  detail: {
    introduction?: string
    overview?: string
    problem?: string
    architecture: string
    challenge?: string
    highlights: string[]
    gallery?: string[]
  } | null
  website?: string
  websites?: { label: string; url: string }[]
  featured: boolean
  isNdaRestricted?: boolean
  order: number
}
type Certificate = { name: string; description: string; date: string; image: string; link?: string }
type Skill = { name: string; description: string; icon: string }
type SkillGroup = { id: string; label: string; items: Skill[] }
type ContactLink = { label: string; value: string; href: string; icon: Component; external: boolean }

const portfolioProjects = projects as Project[]
const portfolioCertificates = certificates as Certificate[]
const portfolioSkills = skillGroups as SkillGroup[]
const appBaseURL = useRuntimeConfig().app.baseURL
const activeProject = ref<Project | null>(null)
const projectDialog = ref<HTMLDialogElement | null>(null)
const activeImagePreview = ref<string | null>(null)
const imagePreviewDialog = ref<HTMLDialogElement | null>(null)
const mobileMenuOpen = ref(false)
const skillQuery = ref('')
let animationContext: { revert: () => void } | undefined
let removeVisibilityListener: (() => void) | undefined
const [firstName, ...remainingName] = profile.name.split(' ')
const lastName = remainingName.join(' ')
const currentYear = '2026'

const primaryProjects = computed(() => portfolioProjects.filter(project => project.order <= 5))
const selectedProjects = computed(() => portfolioProjects.filter(project => project.order > 5))

const filteredSkillGroups = computed(() => {
  const query = skillQuery.value.trim().toLowerCase()
  if (!query) return portfolioSkills

  return portfolioSkills
    .map(group => ({ ...group, items: group.items.filter(skill => `${skill.name} ${skill.description}`.toLowerCase().includes(query)) }))
    .filter(group => group.items.length > 0)
})

const contactLinks = computed<ContactLink[]>(() => {
  const links: (ContactLink | null)[] = [
    profile.github ? { label: 'GitHub', value: profile.github.replace(/^https?:\/\//, ''), href: profile.github, icon: Code, external: true } : null,
    profile.linkedin ? { label: 'LinkedIn', value: profile.linkedin.replace(/^https?:\/\//, ''), href: profile.linkedin, icon: ArrowUpRight, external: true } : null,
    profile.resume ? { label: 'Resume', value: 'View resume', href: profile.resume, icon: FileText, external: true } : null
  ]
  return links.filter((link): link is ContactLink => link !== null)
})

function skillLogoUrl(icon: string) {
  return publicAsset(`skill-icons/${icon}.svg`)
}

function publicAsset(path: string) {
  return `${appBaseURL.replace(/\/?$/, '/')}${path.replace(/^\/+/, '')}`
}

useHead({
  link: [{ rel: 'icon', type: 'image/png', href: publicAsset('profile/me.png') }]
})

function hideBrokenSkillLogo(event: Event) {
  ;(event.currentTarget as HTMLImageElement).hidden = true
}

function openProject(project: Project) {
  activeProject.value = project
  projectDialog.value?.showModal()
}

function openImagePreview(image: string) {
  activeImagePreview.value = image
  imagePreviewDialog.value?.showModal()
}

function closeImagePreview() {
  imagePreviewDialog.value?.close()
}

function handleImagePreviewClose() {
  activeImagePreview.value = null
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

function navigateToSection(event: MouseEvent, sectionId: string, closeMenu = false) {
  event.preventDefault()
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  if (closeMenu) closeMobileMenu()
}

onMounted(async () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger')
  ])

  gsap.registerPlugin(ScrollTrigger)
  const startAnimations = () => {
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
  }

  if (document.hidden) {
    const startWhenVisible = () => {
      if (document.hidden) return
      removeVisibilityListener?.()
      removeVisibilityListener = undefined
      startAnimations()
    }
    document.addEventListener('visibilitychange', startWhenVisible)
    removeVisibilityListener = () => document.removeEventListener('visibilitychange', startWhenVisible)
  } else {
    startAnimations()
  }
})

onBeforeUnmount(() => {
  removeVisibilityListener?.()
  animationContext?.revert()
})
</script>

<template>
  <div class="site-shell">
    <a class="skip-link" href="#main">Skip to content</a>

    <header class="site-header section-wrap">
      <a class="wordmark" href="#top" aria-label="Supacheep Poonsawat, back to top" @click="navigateToSection($event, 'top', true)">
        <span class="wordmark-name">SUPACHEEP POONSAWAT</span>
      </a>

      <nav class="desktop-nav" aria-label="Main navigation">
        <a href="#about" @click="navigateToSection($event, 'about')">About</a>
        <a href="#skills" @click="navigateToSection($event, 'skills')">Skills</a>
        <a href="#projects" @click="navigateToSection($event, 'projects')">Work</a>
        <a href="#certificates" @click="navigateToSection($event, 'certificates')">Certificates</a>
      </nav>

      <a class="resume-link" :href="profile.resume || '#contact'" :target="profile.resume ? '_blank' : undefined" :rel="profile.resume ? 'noreferrer' : undefined" @click="profile.resume ? undefined : navigateToSection($event, 'contact')">
        <span>{{ profile.resume ? 'Résumé' : 'Contact' }}</span>
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
        <a href="#about" @click="navigateToSection($event, 'about', true)">About <ArrowUpRight :size="16" /></a>
        <a href="#skills" @click="navigateToSection($event, 'skills', true)">Skills <ArrowUpRight :size="16" /></a>
        <a href="#projects" @click="navigateToSection($event, 'projects', true)">Work <ArrowUpRight :size="16" /></a>
        <a href="#certificates" @click="navigateToSection($event, 'certificates', true)">Certificates <ArrowUpRight :size="16" /></a>
      </nav>
    </header>

    <main id="main">
      <section id="top" class="hero section-wrap" aria-labelledby="hero-title">
        <div class="eyebrow hero-entrance"><span class="live-dot"></span>{{ profile.role.toUpperCase() }} <span class="eyebrow-divider"></span> {{ profile.study.toUpperCase() }}</div>
        <h1 id="hero-title" class="hero-title hero-entrance"><span>{{ firstName }}</span><span class="hero-title-accent">{{ lastName }}<i>.</i></span></h1>
        <div class="hero-intro hero-entrance">
          <p>{{ profile.study }} crafting considered web experiences from polished interfaces to the systems that power them.</p>
          <div class="hero-actions">
            <a class="button-primary" href="#projects">Explore my work <ArrowRight :size="17" /></a>
            <a class="text-link" href="#contact">Let's talk <ArrowUpRight :size="15" /></a>
          </div>
        </div>
      </section>

      <section id="about" class="about-section section-wrap section-pad" aria-labelledby="about-title">
        <div class="section-kicker" data-reveal><span>01</span><span>ABOUT</span></div>
        <div class="about-grid">
          <div class="about-heading" data-reveal>
            <h2 id="about-title" class="section-heading">Hi! I'm<br><em>Supacheep Poonsawat.</em></h2>
            <img class="about-portrait" :src="publicAsset('profile/me.png')" alt="Portrait of Supacheep Poonsawat" loading="lazy">
          </div>
          <div class="about-body" data-reveal>
            <p class="about-lead">A fullstack developer who cares equally about how a product feels and how reliably it works.</p>
            <p>I turn practical problems into clear, maintainable web experiences. My strongest work sits where Vue and TypeScript meet on the frontend, with .NET, PostgreSQL, and Docker behind the scenes. I'm looking for a team where I can contribute, learn quickly, and ship meaningful work.</p>
            <div class="about-meta">
              <div><span>BASED IN</span><strong>Donmuang, Thailand</strong></div>
              <div><span>FOCUS</span><strong>Fullstack Developer</strong></div>
              <div v-for="education in profile.education" :key="education.school" class="about-education">
                <span>EDUCATION</span>
                <strong>{{ education.degree }} · {{ education.school }}<small>{{ education.period }} · {{ education.schoolUnit }}</small></strong>
              </div>
            </div>
            <div class="about-history">
              <section v-for="experience in profile.experience" :key="experience.company" class="about-history-section">
                <span class="about-history-label">WORK EXPERIENCE</span>
                <article class="about-history-entry">
                  <time>{{ experience.period }}</time>
                  <h3>{{ experience.company }}</h3>
                  <p class="about-entry-role">{{ experience.role }}</p>
                  <ul><li v-for="highlight in experience.highlights" :key="highlight">{{ highlight }}</li></ul>
                </article>
              </section>
            </div>
          </div>
        </div>
      </section>

      <section id="skills" class="skills-section section-wrap section-pad" aria-labelledby="skills-title">
        <div class="section-kicker" data-reveal><span>02</span><span>SKILLS</span></div>
        <div class="skills-layout">
          <div class="skills-intro" data-reveal>
            <h2 id="skills-title" class="section-heading">Tools I use to turn ideas into products.</h2>
            <p>A practical toolkit for designing, building, shipping, and improving modern web applications.</p>
          </div>

          <div class="skill-groups" data-reveal>
            <article v-for="(group, index) in filteredSkillGroups" :key="group.id" class="skill-group">
              <div class="skill-group-heading">
                <span class="skill-group-index">0{{ index + 1 }}</span>
                <h3>{{ group.label }}</h3>
                <span class="skill-count">{{ String(group.items.length).padStart(2, '0') }}</span>
              </div>
              <ul class="skill-list">
                <li v-for="skill in group.items" :key="skill.name" class="skill-item">
                  <span class="skill-logo" aria-hidden="true">
                    <span class="skill-logo-fallback">{{ skill.name.slice(0, 2).replace(/[^a-z0-9]/gi, '').toUpperCase() || '·' }}</span>
                    <img v-if="skill.icon" :src="skillLogoUrl(skill.icon)" alt="" loading="lazy" @error="hideBrokenSkillLogo">
                  </span>
                  <span class="skill-copy"><span class="skill-name">{{ skill.name }}</span><span class="skill-description"> — {{ skill.description }}</span></span>
                </li>
              </ul>
            </article>
            <p v-if="filteredSkillGroups.length === 0" class="skills-empty">No matches for “{{ skillQuery }}”. Try another search.</p>
          </div>
        </div>
      </section>

      <section id="projects" class="projects-section section-wrap section-pad" aria-labelledby="projects-title">
        <div class="section-kicker" data-reveal><span>03</span><span>WORK</span></div>
        <div class="section-head-row projects-heading" data-reveal>
          <h2 id="projects-title" class="section-heading">Made for the<br><span>real world.</span></h2>
          <p class="section-side-note">A small selection of things built to solve real problems, with care taken at every layer.</p>
        </div>

        <div class="project-grid">
          <article v-for="(project, index) in primaryProjects" :key="project.id" class="project-card" data-reveal>
            <button class="project-visual" :class="`project-visual-${project.id}`" type="button" :aria-label="`View details for ${project.name}`" @click="openProject(project)">
              <template v-if="project.detail?.gallery?.length">
                <img
                  class="project-cover-image"
                  :src="publicAsset(project.detail.gallery[0]!)"
                  :alt="`${project.name} project overview`"
                  loading="lazy"
                >
              </template>
              <template v-else-if="project.id === 'bni-miracle'">
                <div class="bni-cover-art" aria-hidden="true">
                  <div class="bni-cover-top"><span>BNI / MIRACLE</span><span>COMMUNITY NETWORK</span></div>
                  <div class="bni-cover-title"><span>CONNECTING PEOPLE & BUSINESS</span><strong>BNI<br><em>MIRACLE</em></strong><span>BUSINESS NETWORK · THAILAND</span></div>
                  <div class="bni-cover-panels"><span>MEMBERS</span><span>SHOWCASES</span><span>EVENTS</span><span>HOT DEALS</span></div>
                </div>
              </template>
              <template v-else-if="project.id === 'ban62'">
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
              </template>
              <template v-else>
                <div class="mini-app mini-suvlet">
                  <div class="mini-suvlet-top"><span>SU VLET</span><span class="mini-suvlet-menu">LISTENING ROOM&nbsp;&nbsp; ↗</span></div>
                  <div class="mini-suvlet-main"><div class="vinyl-record"><div><span>s</span></div></div><div class="mini-track-info"><span>NOW SPINNING · 002</span><strong>Slow afternoons</strong><span>Suvlet Radio · Vol. 02</span></div></div>
                  <div class="mini-waveform" aria-hidden="true"><i v-for="bar in 38" :key="bar" :style="{ '--bar': `${16 + ((bar * 29) % 62)}%` }"></i></div>
                  <div class="mini-player"><span>02:18</span><div class="mini-player-track"><i></i></div><span>04:36</span><span class="mini-play">Ⅱ</span></div>
                  <div class="mini-suvlet-foot"><span>CURATED FOR LATE NIGHTS</span><span>WAVEFORM PLAYER · 01 / 03</span></div>
                </div>
              </template>
              <span v-if="!project.detail?.gallery?.length && project.id !== 'bni-miracle'" class="visual-note">{{ project.id === 'ban62' ? 'A BETTER WAY TO WAIT' : 'A HOME FOR THE IN-BETWEEN' }}</span>
            </button>
            <div class="project-card-copy">
              <div class="project-card-top"><span>0{{ index + 1 }} / FEATURED</span><span>{{ project.role }}</span></div>
              <button class="project-card-title" type="button" :aria-label="`View details for ${project.name}`" @click="openProject(project)"><h3>{{ project.name }}</h3><ArrowUpRight :size="20" /></button>
              <p>{{ project.summary }}</p>
              <div class="project-tags"><span v-for="tag in project.tags.slice(0, 5)" :key="tag">{{ tag }}</span><span v-if="project.tags.length > 5" class="tag-more">+{{ project.tags.length - 5 }}</span></div>
            </div>
          </article>
        </div>

        <div v-if="selectedProjects.length" class="selected-work-list" data-reveal>
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
        <div class="section-kicker" data-reveal><span>04</span><span>CERTIFICATES</span></div>
        <div class="section-head-row certificate-heading" data-reveal>
          <h2 id="certificates-title" class="section-heading">Learning never<br><span>really ships.</span></h2>
          <p class="section-side-note">Courses and credentials that support my continued growth.</p>
        </div>
        <div v-if="portfolioCertificates.length" class="certificate-grid" data-reveal>
          <component
            :is="certificate.link ? 'a' : 'article'"
            v-for="certificate in portfolioCertificates"
            :key="certificate.name"
            class="certificate-item"
            :href="certificate.link"
            :target="certificate.link ? '_blank' : undefined"
            :rel="certificate.link ? 'noreferrer' : undefined"
          >
            <img :src="publicAsset(`certificates/${certificate.image}`)" :alt="`${certificate.name} certificate`" loading="lazy">
            <div class="certificate-item-copy"><h3>{{ certificate.name }}</h3><span>{{ certificate.description }} · {{ certificate.date }}</span></div>
            <ArrowUpRight v-if="certificate.link" :size="17" />
          </component>
        </div>
        <div v-else class="certificate-empty" data-reveal>
          <div class="certificate-empty-mark"><FileText :size="24" :stroke-width="1.5" /></div>
          <div><span>THE WALL IS WAITING</span><p>No certificates added yet.</p></div>
          <span class="certificate-empty-count">— —</span>
        </div>
      </section>

      <section id="contact" class="contact-section" aria-labelledby="contact-title">
        <div class="contact-inner section-wrap section-pad">
          <div class="section-kicker" data-reveal><span>05</span><span>CONTACT</span></div>
          <p class="contact-pretitle" data-reveal></p>
          <div class="contact-main" data-reveal>
            <h2 id="contact-title" class="contact-title">Let's make something<br><em>useful together.</em></h2>
            <div class="contact-aside">
              <p>Contact me for collaborations, inquiries,<br> or just to say hello. 😄</p>
              <a v-if="profile.email" class="contact-method-link" :href="`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(profile.email)}`" target="_blank" rel="noreferrer">{{ profile.email }} <ArrowUpRight :size="17" /></a>
              <a v-if="profile.phone" class="contact-method-link" :href="`tel:${profile.phone}`">{{ profile.phone }} <ArrowUpRight :size="17" /></a>
              <div v-else class="contact-pending">Contact details will be added here.</div>
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
        </div>
      </section>
    </main>

    <footer class="site-footer section-wrap">
      <a class="footer-wordmark" href="#top">SP<span>.</span></a>
      <span>DESIGNED & BUILT BY SUPACHEEP POONSAWAT</span>
      <a href="#top">BACK TO TOP <ArrowUpRight :size="13" /></a>
      <span class="footer-year">{{ currentYear }}</span>
    </footer>

    <dialog ref="projectDialog" class="project-dialog" aria-labelledby="dialog-title" @close="handleDialogClose" @click.self="closeProject" @keydown.esc="closeProject">
      <template v-if="activeProject">
        <div class="dialog-topline"><span>PROJECT NOTES / {{ activeProject.id.toUpperCase() }}</span><button class="dialog-close" type="button" aria-label="Close project details" @click="closeProject"><X :size="19" /></button></div>
        <div class="dialog-content">
          <span class="dialog-role">{{ activeProject.role }}</span>
          <h2 id="dialog-title">{{ activeProject.name }}<span>.</span></h2>
          <p class="dialog-summary">{{ activeProject.summary }}</p>
          <div v-if="activeProject.websites?.length" class="dialog-visit-links">
            <a v-for="website in activeProject.websites" :key="website.url" class="dialog-visit-link" :href="website.url" target="_blank" rel="noreferrer">
              <span>{{ website.label }}</span>
              <ArrowUpRight :size="16" />
            </a>
          </div>
          <a v-else-if="activeProject.website" class="dialog-visit-link" :href="activeProject.website" target="_blank" rel="noreferrer">
            <span>Visit website</span>
            <ArrowUpRight :size="16" />
          </a>
          <div v-if="activeProject.detail?.gallery?.length" class="dialog-gallery">
            <span>PROJECT OVERVIEW</span>
            <div class="dialog-gallery-grid">
              <figure v-for="image in activeProject.detail.gallery" :key="image" class="dialog-gallery-item">
                <button class="dialog-gallery-open" type="button" :aria-label="`Open ${activeProject.name} image full size`" @click="openImagePreview(image)">
                  <img :src="publicAsset(image)" :alt="`${activeProject.name} project overview`" loading="lazy">
                </button>
              </figure>
            </div>
          </div>
          <div v-if="activeProject.detail?.introduction" class="dialog-introduction">
            <span>ABOUT THE PROJECT</span>
            <p>{{ activeProject.detail.introduction }}</p>
          </div>
          <template v-if="activeProject.isNdaRestricted">
            <div class="nda-note"><span>CONFIDENTIALITY NOTE</span><p>Project details are intentionally limited in respect of the applicable NDA.</p></div>
          </template>
          <template v-else-if="activeProject.detail">
            <div class="dialog-detail-grid">
              <div v-if="!activeProject.detail.overview">
                <span>THE CHALLENGE</span>
                <p>{{ activeProject.detail.problem }}</p>
              </div>
              <div>
                <span>{{ activeProject.detail.overview || activeProject.detail.introduction ? 'ARCHITECTURE' : 'THE BUILD' }}</span>
                <p>{{ activeProject.detail.architecture }}</p>
              </div>
              <div v-if="activeProject.detail.challenge">
                <span>NOTABLE TECHNICAL CHALLENGE</span>
                <p>{{ activeProject.detail.challenge }}</p>
              </div>
              <div class="dialog-highlights"><span>IN PRACTICE</span><ul><li v-for="highlight in activeProject.detail.highlights" :key="highlight">{{ highlight }}</li></ul></div>
            </div>
          </template>
          <div v-if="activeProject.tags.length" class="dialog-tags"><span v-for="tag in activeProject.tags" :key="tag">{{ tag }}</span></div>
        </div>
        <div class="dialog-footer"><span>SUPACHEEP POONSAWAT · SELECTED WORK</span><button type="button" @click="closeProject">Close <X :size="15" /></button></div>
      </template>
    </dialog>

    <dialog
      ref="imagePreviewDialog"
      class="image-preview-dialog"
      aria-label="Full-size project image"
      @close="handleImagePreviewClose"
      @click="closeImagePreview"
    >
      <img v-if="activeImagePreview" :src="publicAsset(activeImagePreview)" alt="Full-size project overview image">
    </dialog>
  </div>
</template>
