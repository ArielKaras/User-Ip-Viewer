<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useData, useRoute } from 'vitepress'

const { page } = useData()
const route = useRoute()
const audioUrl = ref(null)
const audioExists = ref(false)
const isPlaying = ref(false)
const audioRef = ref(null)

// Configure your bucket URL here
const BUCKET_BASE_URL = 'https://opsguard-audio-assets.s3.amazonaws.com'

const computeAudioUrl = () => {
  // Get the file name from the path.
  // e.g. /wiki/ARCHITECTURE_DEEP_DIVE.html -> ARCHITECTURE_DEEP_DIVE
  const path = route.path
  if (!path || path === '/') return null
  
  // Clean up path to get slug
  const cleanPath = path.replace(/\.html$/, '').replace(/\/$/, '')
  const slug = cleanPath.split('/').pop()
  
  return `${BUCKET_BASE_URL}/audio/${slug}.mp3`
}

const checkAudioAvailability = async (url) => {
  if (!url) return false
  try {
    // We use a simple fetch HEAD request, or just try to load it.
    // Since we anticipate CORS might be tricky if not set perfectly, 
    // we can also just rely on the audio 'error' event, but checking first is nicer UI.
    const res = await fetch(url, { method: 'HEAD' })
    return res.ok // 200 OK
  } catch (e) {
    // If fetch fails (e.g. network error), we assume it might not exist or be reachable.
    // However, for "seamless" experience, let's return false so we don't show a broken player.
    return false
  }
}

const init = async () => {
  audioExists.value = false
  const url = computeAudioUrl()
  if (url) {
    // Optimistic check:
    const available = await checkAudioAvailability(url)
    if (available) {
      audioUrl.value = url
      audioExists.value = true
    }
  }
}

// Watch for route changes to update player
watch(() => route.path, init)

onMounted(init)
</script>

<template>
  <div v-if="audioExists" class="audio-player-container">
    <div class="audio-label">🎧 Listen to this page</div>
    <audio ref="audioRef" controls :src="audioUrl" class="audio-element"></audio>
  </div>
</template>

<style scoped>
.audio-player-container {
  margin-top: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.audio-label {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-2);
}

.audio-element {
  width: 100%;
  height: 40px;
}
</style>
