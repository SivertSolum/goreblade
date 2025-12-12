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
    }
    
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.muted ? 0 : this.volume;
        } catch (e) {
            console.warn('Web Audio not supported');
            this.enabled = false;
        }
    }
    
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
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
        if (this.masterGain) {
            this.masterGain.gain.value = this.muted ? 0 : this.volume;
        }
        return this.muted;
    }
    
    setMuted(muted) {
        this.muted = muted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.muted ? 0 : this.volume;
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
}

const Audio = new AudioManager();

