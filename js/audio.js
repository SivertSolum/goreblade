// ============================================
// GOREBLADE: UNHOLY SURVIVORS
// Audio System - Retro Procedural Sounds
// ============================================

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.enabled = true;
        this.muted = false;
        this.volume = 0.3;
        this.musicVolume = 0.4;
        
        // Music system
        this.music = null;
        this.currentTrack = null;
        this.musicPlaying = false;
    }
    
    init() {
        // Skip if already initialized
        if (this.audioContext) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.muted ? 0 : this.volume;
            
            // Resume on any user interaction (browser autoplay policy)
            const resumeAudio = () => {
                this.resume();
                document.removeEventListener('click', resumeAudio);
                document.removeEventListener('keydown', resumeAudio);
            };
            document.addEventListener('click', resumeAudio, { once: true });
            document.addEventListener('keydown', resumeAudio, { once: true });
        } catch (e) {
            console.warn('Web Audio not supported');
            this.enabled = false;
        }
        
        // Initialize music element
        this.initMusic();
    }
    
    initMusic() {
        // Use document.createElement to avoid conflict with our Audio class
        this.music = document.createElement('audio');
        this.music.loop = true;
        this.music.volume = this.muted ? 0 : this.musicVolume;
        
        // Preload the main gameplay track
        this.music.src = 'music/goreblade_main.mp3';
        this.music.load();
        
        // Handle music end (backup for loop)
        this.music.addEventListener('ended', () => {
            if (this.musicPlaying) {
                this.music.currentTime = 0;
                this.music.play().catch(() => {});
            }
        });
    }
    
    // Start playing music
    playMusic(track = 'main') {
        if (!this.music) return;
        
        // If different track requested, load it
        if (track !== this.currentTrack) {
            switch(track) {
                case 'main':
                    this.music.src = 'music/goreblade_main.mp3';
                    break;
                // Add more tracks here as needed
                // case 'boss':
                //     this.music.src = 'music/goreblade_boss.mp3';
                //     break;
                default:
                    this.music.src = 'music/goreblade_main.mp3';
            }
            this.currentTrack = track;
        }
        
        this.musicPlaying = true;
        this.music.volume = this.muted ? 0 : this.musicVolume;
        this.music.play().catch(e => {
            console.log('Music autoplay blocked - will start on user interaction');
        });
    }
    
    // Stop music
    stopMusic() {
        if (!this.music) return;
        this.musicPlaying = false;
        this.music.pause();
        this.music.currentTime = 0;
    }
    
    // Pause music
    pauseMusic() {
        if (!this.music) return;
        this.music.pause();
    }
    
    // Resume music
    resumeMusic() {
        if (!this.music || !this.musicPlaying) return;
        this.music.play().catch(() => {});
    }
    
    // Set music volume (0-1)
    setMusicVolume(vol) {
        this.musicVolume = vol;
        if (this.music && !this.muted) {
            this.music.volume = vol;
        }
    }
    
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        // Also resume music if it was playing
        if (this.musicPlaying && this.music && this.music.paused) {
            this.music.play().catch(() => {});
        }
    }
    
    setVolume(vol) {
        this.volume = vol;
        if (this.masterGain && !this.muted) {
            this.masterGain.gain.value = vol;
        }
    }
    
    toggleMute() {
        this.muted = !this.muted;
        
        // Resume audio context on unmute (handles browser autoplay policy)
        if (!this.muted) {
            this.resume();
        }
        
        if (this.masterGain) {
            this.masterGain.gain.value = this.muted ? 0 : this.volume;
        }
        // Also mute/unmute music
        if (this.music) {
            this.music.volume = this.muted ? 0 : this.musicVolume;
        }
        return this.muted;
    }
    
    setMuted(muted) {
        this.muted = muted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.muted ? 0 : this.volume;
        }
        // Also mute/unmute music
        if (this.music) {
            this.music.volume = this.muted ? 0 : this.musicVolume;
        }
    }
    
    // Retro pew pew shoot sound
    playShoot(type = 'basic') {
        if (!this.enabled || !this.audioContext) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        const now = this.audioContext.currentTime;
        
        switch(type) {
            case 'basic':
                osc.type = 'square';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
                
            case 'spread':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.08);
                break;
                
            case 'laser':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1200, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
                break;
                
            case 'orbit':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.setValueAtTime(500, now + 0.05);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
        }
    }
    
    // Enemy hit sound
    playHit() {
        if (!this.enabled || !this.audioContext) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        const now = this.audioContext.currentTime;
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        osc.start(now);
        osc.stop(now + 0.05);
    }
    
    // Enemy death sound - chunky splat
    playDeath() {
        if (!this.enabled || !this.audioContext) return;
        
        // Noise burst for splat
        const bufferSize = this.audioContext.sampleRate * 0.15;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }
        
        const noise = this.audioContext.createBufferSource();
        const filter = this.audioContext.createBiquadFilter();
        const gain = this.audioContext.createGain();
        
        noise.buffer = buffer;
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        
        noise.start();
    }
    
    // Player damage
    playPlayerHit() {
        if (!this.enabled || !this.audioContext) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        const now = this.audioContext.currentTime;
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.start(now);
        osc.stop(now + 0.2);
    }
    
    // XP pickup
    playPickup() {
        if (!this.enabled || !this.audioContext) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        const now = this.audioContext.currentTime;
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(800, now + 0.05);
        osc.frequency.setValueAtTime(1000, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc.start(now);
        osc.stop(now + 0.15);
    }
    
    // Level up / Wave complete
    playLevelUp() {
        if (!this.enabled || !this.audioContext) return;
        
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        
        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            const startTime = this.audioContext.currentTime + i * 0.1;
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.15, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
            
            osc.start(startTime);
            osc.stop(startTime + 0.3);
        });
    }
    
    // Boss warning
    playBossWarning() {
        if (!this.enabled || !this.audioContext) return;
        
        for (let i = 0; i < 3; i++) {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            const startTime = this.audioContext.currentTime + i * 0.3;
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(100, startTime);
            osc.frequency.setValueAtTime(150, startTime + 0.15);
            gain.gain.setValueAtTime(0.25, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);
            
            osc.start(startTime);
            osc.stop(startTime + 0.25);
        }
    }
    
    // Game over
    playGameOver() {
        if (!this.enabled || !this.audioContext) return;
        
        const notes = [392, 349, 330, 262]; // G4, F4, E4, C4 - sad descending
        
        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            const startTime = this.audioContext.currentTime + i * 0.25;
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.2, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
            
            osc.start(startTime);
            osc.stop(startTime + 0.4);
        });
    }
    
    // Victory fanfare
    playVictory() {
        if (!this.enabled || !this.audioContext) return;
        
        const notes = [523, 523, 523, 523, 415, 466, 523, 466, 523]; 
        const durations = [0.15, 0.15, 0.15, 0.4, 0.15, 0.15, 0.15, 0.15, 0.6];
        
        let time = this.audioContext.currentTime;
        
        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, time);
            gain.gain.setValueAtTime(0.15, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + durations[i] * 0.9);
            
            osc.start(time);
            osc.stop(time + durations[i]);
            
            time += durations[i];
        });
    }
    
    // Explosion sound (for bloaters, etc)
    playExplosion() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        // Low rumble
        const osc1 = this.audioContext.createOscillator();
        const gain1 = this.audioContext.createGain();
        osc1.connect(gain1);
        gain1.connect(this.masterGain);
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(80, now);
        osc1.frequency.exponentialRampToValueAtTime(30, now + 0.3);
        gain1.gain.setValueAtTime(0.3, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc1.start(now);
        osc1.stop(now + 0.3);
        
        // Noise burst
        const bufferSize = this.audioContext.sampleRate * 0.2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
        }
        const noise = this.audioContext.createBufferSource();
        const gain2 = this.audioContext.createGain();
        noise.buffer = buffer;
        noise.connect(gain2);
        gain2.connect(this.masterGain);
        gain2.gain.setValueAtTime(0.4, now);
        noise.start(now);
    }
    
    // Power up / upgrade sound
    playPowerUp() {
        if (!this.enabled || !this.audioContext) return;
        
        const notes = [440, 554, 659]; // A4, C#5, E5 - major chord arpeggio
        
        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            const startTime = this.audioContext.currentTime + i * 0.08;
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.15, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
            
            osc.start(startTime);
            osc.stop(startTime + 0.2);
        });
    }
    
    // Menu hover sound - subtle blip
    playMenuHover() {
        if (!this.enabled || !this.audioContext) return;
        if (this.audioContext.state === 'suspended') return; // Don't play if suspended
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        const now = this.audioContext.currentTime;
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(450, now + 0.02);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        osc.start(now);
        osc.stop(now + 0.05);
    }
    
    // Menu select/click sound - satisfying click
    playMenuSelect() {
        if (!this.enabled || !this.audioContext) return;
        
        // Resume context if suspended (first click will resume it)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        const now = this.audioContext.currentTime;
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(800, now + 0.03);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        osc.start(now);
        osc.stop(now + 0.08);
    }
    
    // Menu back sound - descending tone
    playMenuBack() {
        if (!this.enabled || !this.audioContext) return;
        
        // Resume context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        const now = this.audioContext.currentTime;
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }
    
    // Menu navigation sound - for changing selection with keyboard/controller
    playMenuNavigate() {
        if (!this.enabled || !this.audioContext) return;
        
        // Resume context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        const now = this.audioContext.currentTime;
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.setValueAtTime(400, now + 0.02);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
        
        osc.start(now);
        osc.stop(now + 0.04);
    }
}

const Audio = new AudioManager();

