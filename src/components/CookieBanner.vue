<template>
  <div
    v-if="greyOutBody && showCookieBanner"
    class="cookie-banner-body-grey-out"
  />
  <aside
    v-if="showCookieBanner && !isModalOpen"
    class="cookie-banner"
    :class="{ 'cookie-banner--modal-open': isModalOpen }"
  >
    <div class="cookie-banner__header">
      <slot name="header">
        <h3 class="cookie-banner__header-title">{{ headerTitle }}</h3>
        <p
          class="cookie-banner__header-description"
          v-html="headerDescription"
        />
      </slot>
    </div>

    <div class="cookie-banner__actions">
      <cookie-banner-button @handle-click="handleRejectAll">
        {{ rejectAllLabel }}
      </cookie-banner-button>
      <cookie-banner-button @handle-click="openPreferences">
        {{ preferencesLabel }}
      </cookie-banner-button>
      <cookie-banner-button
        class-name="cookie-banner__button-accept"
        @handle-click="handleAcceptAll"
      >
        {{ acceptAllLabel }}
      </cookie-banner-button>
    </div>
  </aside>
  <Teleport :to="target">
    <cookie-banner-modal
      v-if="isModalOpen"
      :preferences="preferences"
      :show-accept-all-in-modal="showAcceptAllInModal"
      @cookie-banner-save="onSave"
      @cookie-banner-accept-all="handleAcceptAll"
      @cookie-banner-close="isModalOpen = false"
    >
      <template #modal-header>
        <slot name="modal-header"></slot>
      </template>

      <template #modal-body="{ preference, index }">
        <slot
          name="modal-body"
          :preference="preference"
          :index="index"
        ></slot>
      </template>

      <template #modal-footer>
        <slot name="modal-footer"></slot>
      </template>
    </cookie-banner-modal>
  </Teleport>

  <aside
    v-if="showEditButton && !showCookieBanner"
    class="cookie-banner-edit"
  >
    <cookie-banner-button
      class-name="cookie-banner__edit-button"
      @handle-click="openPreferences"
    >
      <img :src="editCookieIconPath" alt="edit cookies">
    </cookie-banner-button>

    <Teleport :to="target">
      <cookie-banner-modal
        v-if="isModalOpen"
        :preferences="preferences"
        :show-accept-all-in-modal="showAcceptAllInModal"
        @cookie-banner-save="onSave"
        @cookie-banner-accept-all="handleAcceptAll"
        @cookie-banner-close="isModalOpen = false"
      >
        <template #modal-header>
          <slot name="modal-header"></slot>
        </template>

        <template #modal-body="{ preference, index }">
          <slot
            name="modal-body"
            :preference="preference"
            :index="index"
          ></slot>
        </template>

        <template #modal-footer>
          <slot name="modal-footer"></slot>
        </template>
      </cookie-banner-modal>
    </Teleport>
  </aside>
</template>

<script setup lang="ts">
import { defineProps, onMounted, ref, defineExpose, WritableComputedRef, watch } from "vue"
import { getConsentValuesFromStorage } from '../shared/storageUtils'
import CookieBannerModal from './CookieBannerModal.vue'
import CookieBannerButton from './CookieBannerButton.vue'
import { useScrollLock } from '@vueuse/core'

interface Props {
  headerTitle?: string
  headerDescription?: string
  preferencesLabel?: string
  acceptAllLabel?: string
  rejectAllLabel?: string
  preferences: Array<unknown>
  target?: string
  greyOutBody?: boolean
  showAcceptAllInModal?: boolean
  showEditButton?: boolean
  editCookieIconPath?: string
}

interface Emits {
  (e: 'on-accept-all-cookies'): void
  (e: 'on-save-cookie-preferences', payload: Array<unknown>): void
  (e: 'on-reject-all-cookies'): void
  (e: 'on-cookie-banner-mount'): void
  (e: 'on-cookie-banner-mount', payload: Array<string> | string): void
}

const props = withDefaults(defineProps<Props>(), {
  headerTitle: 'Cookie Settings',
  headerDescription: 'We use cookies and similar technologies to help personalize content and offer a better experience. You can opt to customize them by clicking the preferences button.',
  preferencesLabel: 'Preferences',
  acceptAllLabel: 'Accept All',
  rejectAllLabel: 'Reject All',
  preferences: () => ([]),
  target: 'body',
  greyOutBody: false,
  showAcceptAllInModal: false,
  showEditButton: false,
  editCookieIconPath: '~@/../src/assets/cookie_edit.svg'
})

const emit = defineEmits<Emits>()

const showCookieBanner = ref(true)
const isModalOpen = ref(false)

onMounted((): void => {
  checkValues()
})

const body: HTMLBodyElement | null = document.querySelector('body')
const isBodyLocked: WritableComputedRef<boolean> = useScrollLock(body, false)

watch([showCookieBanner, isModalOpen], () => {
  if (showCookieBanner.value || isModalOpen.value) {
    isBodyLocked.value = true
    return
  }
  isBodyLocked.value = false
})

const checkValues = (): void => {
  const searchParams = new URLSearchParams(document.location.search)
  const consent = searchParams.get('consent')
  if (consent || localStorage.getItem('cookie-banner')) {
    showCookieBanner.value = false;
  }
  if (consent) {
    let consentValues: Array<string>
    try {
      consentValues = JSON.parse(consent)
    } catch (error) {
      console.log('Error parsing consent values.');
    }
    onSave(consentValues)
  }
  emit('on-cookie-banner-mount', getConsentValuesFromStorage());
}


const handleAcceptAll = (): void => {
  isModalOpen.value = false
  showCookieBanner.value = false;
  localStorage.setItem('cookie-banner', 'all');
  emit('on-accept-all-cookies');
}
const handleRejectAll = (): void => {
  showCookieBanner.value = false;
  localStorage.setItem('cookie-banner', '[]');
  emit('on-reject-all-cookies');
}
const openPreferences = (): void => {
  isModalOpen.value = true;
}
const onSave = (data: Array<string>): void => {
  isModalOpen.value = false;
  showCookieBanner.value = false;

  // transform Proxy into array of selected preferences
  const preferencesArray = Object.values(data);

  localStorage.setItem('cookie-banner', JSON.stringify(preferencesArray));
  emit('on-save-cookie-preferences', preferencesArray);
}
const openCookieBanner = (): void => {
  showCookieBanner.value = true
}
const getAcceptedServices = (): Array<string> => {
  return getConsentValuesFromStorage()
}

defineExpose({openCookieBanner, getAcceptedServices})
</script>

<style lang="css">
@import '../styles/variables.css';

/* Render cookie comply out of viewport to reduce LCP */
@keyframes fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 0.8;
  }
}
@keyframes slide-up {
  0% {
    transform: translateY(110vh);
  }
  100% {
    transform: translateY(0vh);
  }
}

.cookie-banner-body-grey-out {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: #000;
  opacity: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  animation: fade-in 1s forwards;
}

.cookie-banner {
  display: grid;
  grid-gap: var(--spacing-lg);
  grid-template-columns: 1fr minmax(35%, 40%);
  position: fixed;
  bottom: var(--spacing-sm);
  left: var(--spacing-sm);
  right: var(--spacing-sm);
  background-color: var(--color-white);
  box-shadow: var(--box-shadow);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  animation: slide-up 1s forwards;
  transform: translateY(110vh);
}

.cookie-banner-edit {
  position: fixed;
  bottom: var(--spacing-sm);
  left: var(--spacing-sm);
  right: var(--spacing-sm);
}

@media (max-width: 1024px) {
  .cookie-banner {
    grid-template-columns: none;
  }
}

.cookie-banner__header {
  justify-self: flex-start;
  text-align: initial;
}

.cookie-banner__header-title,
.cookie-banner__header-description {
  margin: 0;
}
.cookie-banner__header-title {
  margin-bottom: var(--spacing-sm);
}
.cookie-banner__header-description {
  line-height: 20px;
}

.cookie-banner__actions {
  display: grid;
  grid-gap: var(--spacing-lg);
  grid-template-columns: repeat(3, 1fr);
  align-self: center;
}

@media (max-width: 480px) {
  .cookie-banner__header {
    margin-bottom: var(--spacing-sm);
  }

  .cookie-banner__actions {
    grid-template-columns: auto;
  }
}

.cookie-banner__button-accept {
  background-color: var(--color-green);
  color: var(--color-white);
  border: none;
}
</style>
