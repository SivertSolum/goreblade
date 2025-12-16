// ============================================
// GOREBLADE: UNHOLY SURVIVORS
// Xbox Controller Support
// ============================================

class ControllerManager {
    constructor() {
        this.gamepad = null;
        this.gamepadIndex = null;
        this.connected = false;
        
        // Button states (for detecting presses vs holds)
        this.previousButtons = [];
        this.currentButtons = [];
        
        // Axis states
        this.leftStickX = 0;
        this.leftStickY = 0;
        this.rightStickX = 0;
        this.rightStickY = 0;
        
        // Dead zone for analog sticks
        this.deadZone = 0.2;
        
        // Button mapping (Xbox controller)
        this.BUTTONS = {
            A: 0,           // Select/Confirm
            B: 1,           // Back/Cancel
            X: 2,
            Y: 3,
            LB: 4,          // Left Bumper
            RB: 5,          // Right Bumper
            LT: 6,          // Left Trigger
            RT: 7,          // Right Trigger
            SELECT: 8,      // Back/View
            START: 9,       // Start/Menu
            L3: 10,         // Left Stick Press
            R3: 11,         // Right Stick Press
            DPAD_UP: 12,
            DPAD_DOWN: 13,
            DPAD_LEFT: 14,
            DPAD_RIGHT: 15
        };
        
        // Upgrade selection
        this.selectedUpgrade = 0;
        this.upgradeCount = 0;
        
        // Setup event listeners
        this.setupListeners();
    }
    
    setupListeners() {
        window.addEventListener('gamepadconnected', (e) => {
            console.log('🎮 Controller connected:', e.gamepad.id);
            this.gamepadIndex = e.gamepad.index;
            this.connected = true;
            this.showControllerNotification('Controller Connected!');
        });
        
        window.addEventListener('gamepaddisconnected', (e) => {
            console.log('🎮 Controller disconnected');
            if (this.gamepadIndex === e.gamepad.index) {
                this.gamepadIndex = null;
                this.connected = false;
            }
        });
    }
    
    showControllerNotification(message) {
        // Create temporary notification
        const notif = document.createElement('div');
        notif.className = 'controller-notification';
        notif.textContent = '🎮 ' + message;
        notif.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #4A0000;
            color: #F5F5DC;
            padding: 10px 20px;
            font-family: 'Press Start 2P', monospace;
            font-size: 0.6rem;
            border: 2px solid #DC143C;
            z-index: 9999;
            animation: fadeInOut 2s forwards;
        `;
        document.body.appendChild(notif);
        
        setTimeout(() => notif.remove(), 2000);
    }
    
    update() {
        if (this.gamepadIndex === null) return;
        
        // Get fresh gamepad state
        const gamepads = navigator.getGamepads();
        this.gamepad = gamepads[this.gamepadIndex];
        
        if (!this.gamepad) return;
        
        // Store previous button states
        this.previousButtons = [...this.currentButtons];
        this.currentButtons = this.gamepad.buttons.map(b => b.pressed);
        
        // Update analog stick values with dead zone
        this.leftStickX = this.applyDeadZone(this.gamepad.axes[0]);
        this.leftStickY = this.applyDeadZone(this.gamepad.axes[1]);
        this.rightStickX = this.applyDeadZone(this.gamepad.axes[2]);
        this.rightStickY = this.applyDeadZone(this.gamepad.axes[3]);
    }
    
    applyDeadZone(value) {
        if (Math.abs(value) < this.deadZone) return 0;
        // Normalize the value beyond dead zone
        const sign = value > 0 ? 1 : -1;
        return sign * (Math.abs(value) - this.deadZone) / (1 - this.deadZone);
    }
    
    // Check if button is currently pressed
    isPressed(buttonIndex) {
        return this.currentButtons[buttonIndex] || false;
    }
    
    // Check if button was just pressed this frame
    justPressed(buttonIndex) {
        return this.currentButtons[buttonIndex] && !this.previousButtons[buttonIndex];
    }
    
    // Check if button was just released this frame
    justReleased(buttonIndex) {
        return !this.currentButtons[buttonIndex] && this.previousButtons[buttonIndex];
    }
    
    // Get movement input from left stick (returns {x, y} normalized)
    getMovement() {
        return {
            x: this.leftStickX,
            y: this.leftStickY
        };
    }
    
    // Get aim direction from right stick
    getAimDirection() {
        return {
            x: this.rightStickX,
            y: this.rightStickY
        };
    }
    
    // Handle menu navigation
    handleMenuNavigation() {
        if (this.justPressed(this.BUTTONS.DPAD_LEFT)) {
            return 'left';
        }
        if (this.justPressed(this.BUTTONS.DPAD_RIGHT)) {
            return 'right';
        }
        if (this.justPressed(this.BUTTONS.DPAD_UP)) {
            return 'up';
        }
        if (this.justPressed(this.BUTTONS.DPAD_DOWN)) {
            return 'down';
        }
        if (this.justPressed(this.BUTTONS.A)) {
            return 'select';
        }
        if (this.justPressed(this.BUTTONS.B)) {
            return 'back';
        }
        if (this.justPressed(this.BUTTONS.START)) {
            return 'start';
        }
        return null;
    }
    
    // Update upgrade selection highlight
    updateUpgradeSelection(choices) {
        this.upgradeCount = choices;
        const cards = document.querySelectorAll('.upgrade-card');
        
        cards.forEach((card, index) => {
            if (index === this.selectedUpgrade) {
                card.classList.add('controller-selected');
            } else {
                card.classList.remove('controller-selected');
            }
        });
    }
    
    selectNextUpgrade() {
        this.selectedUpgrade = (this.selectedUpgrade + 1) % this.upgradeCount;
        Audio.playMenuNavigate();
    }
    
    selectPrevUpgrade() {
        this.selectedUpgrade = (this.selectedUpgrade - 1 + this.upgradeCount) % this.upgradeCount;
        Audio.playMenuNavigate();
    }
    
    resetUpgradeSelection() {
        this.selectedUpgrade = 0;
    }
    
    getCurrentUpgradeIndex() {
        return this.selectedUpgrade;
    }
}

// Global controller instance
const Controller = new ControllerManager();

// Add CSS for controller selection
const controllerStyle = document.createElement('style');
controllerStyle.textContent = `
    .upgrade-card.controller-selected {
        transform: translateY(-10px) scale(1.05);
        border-color: #FFD700 !important;
        box-shadow: 0 0 30px #FFD700, 0 0 60px #FFD700;
    }
    
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
        20% { opacity: 1; transform: translateX(-50%) translateY(0); }
        80% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
    
    .controller-hint {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.5rem;
        color: #888;
    }
`;
document.head.appendChild(controllerStyle);

