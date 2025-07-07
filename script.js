class ImagePixelizer {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 캔버스 설정 - 픽셀화를 위해 이미지 스무딩 비활성화
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.imageSmoothingQuality = 'low';
        
        // UI 요소들
        this.uploadBtn = document.getElementById('uploadBtn');
        this.imageInput = document.getElementById('imageInput');
        this.pasteBtn = document.getElementById('pasteBtn');
        this.originalBtn = document.getElementById('originalBtn');
        this.pixelBtn = document.getElementById('pixelBtn');
        this.noGridBtn = document.getElementById('noGridBtn');
        this.gridBtn = document.getElementById('gridBtn');
        this.dotBtn = document.getElementById('dotBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.exportDropdown = document.getElementById('exportDropdown');
        this.downloadLink = document.getElementById('downloadLink');
        this.toast = document.getElementById('toast');
        
        // 모바일 UI 요소들
        this.mobileControls = document.getElementById('mobileControls');
        this.mobileUploadBtn = document.getElementById('mobileUploadBtn');
        this.mobilePasteBtn = document.getElementById('mobilePasteBtn');
        this.mobileModeBtn = document.getElementById('mobileModeBtn');
        this.mobileGridBtn = document.getElementById('mobileGridBtn');
        this.mobileEffectBtn = document.getElementById('mobileEffectBtn');
        this.mobilePixelSlider = document.getElementById('mobilePixelSlider');
        this.mobilePixelValue = document.getElementById('mobilePixelValue');
        this.mobileExportBtn = document.getElementById('mobileExportBtn');
        this.mobileHelpBtn = document.getElementById('mobileHelpBtn');
        
        // 설정 객체
        this.settings = {
            pixelSize: 32,
            brightness: 1.0,
            contrast: 1.0,
            saturation: 1.0,
            gridColor: '#dddddd',
            gridWidth: 1,
            dotColor: '#dddddd',
            dotSize: 4,
            exportQuality: 0.9,
            exportScale: 1.0
        };
        
        // 상태 변수들
        this.currentMode = 'original'; // 'original' 또는 'pixel'
        this.currentGridMode = 'none'; // 'none', 'grid', 'dot'
        this.originalImage = null;
        this.imageLoaded = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupGUI();
        this.resizeCanvas();
        this.showPlaceholder();
    }
    
    setupEventListeners() {
        // 업로드 버튼 클릭
        this.uploadBtn.addEventListener('click', () => {
            this.imageInput.click();
        });
        
        // 파일 선택
        this.imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadImage(file);
            }
        });
        
        // 클립보드 붙여넣기 버튼
        this.pasteBtn.addEventListener('click', () => {
            this.pasteFromClipboard();
        });
        
        // 전역 클립보드 이벤트 (Ctrl+V, Cmd+V)
        document.addEventListener('paste', (e) => {
            e.preventDefault();
            this.handlePasteEvent(e);
        });
        
        // 모드 전환 버튼들
        this.originalBtn.addEventListener('click', () => {
            this.setMode('original');
        });
        
        this.pixelBtn.addEventListener('click', () => {
            this.setMode('pixel');
        });
        
        // 그리드 모드 전환 버튼들
        this.noGridBtn.addEventListener('click', () => {
            this.setGridMode('none');
        });
        
        this.gridBtn.addEventListener('click', () => {
            this.setGridMode('grid');
        });
        
        this.dotBtn.addEventListener('click', () => {
            this.setGridMode('dot');
        });
        
        // 내보내기 버튼
        this.exportBtn.addEventListener('click', () => {
            this.toggleExportDropdown();
        });
        
        // 내보내기 옵션들
        this.exportDropdown.addEventListener('click', (e) => {
            if (e.target.classList.contains('export-option')) {
                const format = e.target.dataset.format;
                this.exportImage(format);
                this.hideExportDropdown();
            }
        });
        
        // 드롭다운 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (!this.exportBtn.contains(e.target) && !this.exportDropdown.contains(e.target)) {
                this.hideExportDropdown();
            }
        });
        
        // 윈도우 리사이즈
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            if (this.imageLoaded) {
                this.renderImage();
            } else {
                this.showPlaceholder();
            }
        });
        
        // 모바일 터치 이벤트 지원
        this.setupTouchEvents();
        
        // 모바일에서 화면 방향 변경 감지
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.resizeCanvas();
                if (this.imageLoaded) {
                    this.renderImage();
                } else {
                    this.showPlaceholder();
                }
            }, 100);
        });
        
        // 모바일 컨트롤 패널 이벤트 리스너
        this.setupMobileControls();
    }
    
    setupMobileControls() {
        // 모바일 업로드 버튼
        this.mobileUploadBtn.addEventListener('click', () => {
            this.imageInput.click();
        });
        
        // 모바일 붙여넣기 버튼
        this.mobilePasteBtn.addEventListener('click', () => {
            this.pasteFromClipboard();
        });
        
        // 모바일 모드 전환 버튼
        this.mobileModeBtn.addEventListener('click', () => {
            this.toggleMode();
        });
        
        // 모바일 그리드 모드 버튼
        this.mobileGridBtn.addEventListener('click', () => {
            this.cycleGridMode();
        });
        
        // 모바일 효과 변경 버튼
        this.mobileEffectBtn.addEventListener('click', () => {
            this.cycleImageEffect();
        });
        
        // 모바일 픽셀 크기 슬라이더
        this.mobilePixelSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.settings.pixelSize = value;
            this.mobilePixelValue.textContent = value;
            
            if (this.imageLoaded && this.currentMode === 'pixel') {
                this.renderImage();
            }
        });
        
        // 모바일 내보내기 버튼
        this.mobileExportBtn.addEventListener('click', () => {
            this.showMobileExportOptions();
        });
        
        // 모바일 도움말 버튼
        this.mobileHelpBtn.addEventListener('click', () => {
            this.showMobileHelp();
        });
        
        // 초기 슬라이더 값 설정
        this.mobilePixelSlider.value = this.settings.pixelSize;
        this.mobilePixelValue.textContent = this.settings.pixelSize;
    }
    
    showMobileExportOptions() {
        const options = [
            { format: 'png', label: 'PNG로 저장' },
            { format: 'jpeg', label: 'JPEG로 저장' },
            { format: 'webp', label: 'WebP로 저장' },
            { format: 'svg', label: 'SVG로 저장' }
        ];
        
        const message = options.map(option => 
            `${option.label}`
        ).join('\n');
        
        if (confirm('내보내기 형식을 선택하세요:\n\n' + message + '\n\n확인을 누르면 PNG로 저장됩니다.')) {
            this.exportImage('png');
        }
    }
    
    showMobileHelp() {
        const helpText = `
📱 모바일 사용법:

👆 터치 제스처:
• 더블 탭: 원본/픽셀 모드 전환
• 왼쪽 스와이프: 그리드 모드 변경
• 오른쪽 스와이프: 이미지 효과 변경

🎛️ 컨트롤 패널:
• 원본/픽셀: 모드 전환
• 그리드 모드: 그리드 스타일 변경
• 효과 변경: 밝기/대비/채도 조정
• 픽셀 크기: 슬라이더로 조정
• 내보내기: 이미지 저장
• 도움말: 이 메시지 표시

📸 이미지 업로드:
• "이미지 업로드" 버튼 사용
• 또는 클립보드에서 붙여넣기
        `;
        
        alert(helpText);
    }
    
    setupTouchEvents() {
        // 터치 제스처 변수들
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.lastTouchTime = 0;
        this.touchCount = 0;
        
        // 캔버스 터치 이벤트
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleTouchStart(e);
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleTouchMove(e);
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleTouchEnd(e);
        }, { passive: false });
        
        // 모바일에서 더블 탭으로 모드 전환
        this.canvas.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const timeDiff = currentTime - this.lastTouchTime;
            
            if (timeDiff < 300 && timeDiff > 0) {
                // 더블 탭 감지
                this.toggleMode();
            }
            
            this.lastTouchTime = currentTime;
        });
        
        // 모바일에서 스와이프 제스처
        let startX = 0;
        let startY = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // 수평 스와이프 감지 (최소 50px)
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // 왼쪽 스와이프 - 그리드 모드 변경
                    this.cycleGridMode();
                } else {
                    // 오른쪽 스와이프 - 이미지 효과 조정
                    this.cycleImageEffect();
                }
            }
            
            startX = 0;
            startY = 0;
        });
    }
    
    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
    }
    
    handleTouchMove(e) {
        // 터치 이동 중 스크롤 방지
        e.preventDefault();
    }
    
    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].clientX;
        this.touchEndY = e.changedTouches[0].clientY;
    }
    
    toggleMode() {
        if (this.currentMode === 'original') {
            this.setMode('pixel');
        } else {
            this.setMode('original');
        }
    }
    
    cycleGridMode() {
        const modes = ['none', 'grid', 'dot'];
        const currentIndex = modes.indexOf(this.currentGridMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.setGridMode(modes[nextIndex]);
    }
    
    cycleImageEffect() {
        // 이미지 효과 순환 (밝기, 대비, 채도)
        const effects = [
            { brightness: 1.0, contrast: 1.0, saturation: 1.0 },
            { brightness: 1.2, contrast: 1.1, saturation: 1.0 },
            { brightness: 0.8, contrast: 1.2, saturation: 1.1 },
            { brightness: 1.1, contrast: 0.9, saturation: 1.2 }
        ];
        
        const currentEffect = `${this.settings.brightness}-${this.settings.contrast}-${this.settings.saturation}`;
        let nextIndex = 0;
        
        for (let i = 0; i < effects.length; i++) {
            const effect = effects[i];
            const effectString = `${effect.brightness}-${effect.contrast}-${effect.saturation}`;
            if (effectString === currentEffect) {
                nextIndex = (i + 1) % effects.length;
                break;
            }
        }
        
        const nextEffect = effects[nextIndex];
        this.settings.brightness = nextEffect.brightness;
        this.settings.contrast = nextEffect.contrast;
        this.settings.saturation = nextEffect.saturation;
        
        if (this.imageLoaded) {
            this.renderImage();
        }
        
        this.showMessage(`이미지 효과 변경: 밝기 ${nextEffect.brightness}, 대비 ${nextEffect.contrast}, 채도 ${nextEffect.saturation}`);
    }
    
    setupGUI() {
        const gui = new dat.GUI();
        
        // 픽셀화 설정
        const pixelFolder = gui.addFolder('픽셀화 설정');
        pixelFolder.add(this.settings, 'pixelSize', 1, 64)
                  .name('픽셀 크기')
                  .onChange(() => {
                      if (this.imageLoaded && this.currentMode === 'pixel') {
                          this.renderImage();
                      }
                  });
        
        // 이미지 효과 설정
        const effectsFolder = gui.addFolder('이미지 효과');
        effectsFolder.add(this.settings, 'brightness', 0.1, 3.0)
                    .name('밝기')
                    .onChange(() => {
                        if (this.imageLoaded) {
                            this.renderImage();
                        }
                    });
        effectsFolder.add(this.settings, 'contrast', 0.1, 3.0)
                    .name('대비')
                    .onChange(() => {
                        if (this.imageLoaded) {
                            this.renderImage();
                        }
                    });
        effectsFolder.add(this.settings, 'saturation', 0.0, 3.0)
                    .name('채도')
                    .onChange(() => {
                        if (this.imageLoaded) {
                            this.renderImage();
                        }
                    });
        
        // 그리드 설정
        const gridFolder = gui.addFolder('그리드 설정');
        gridFolder.addColor(this.settings, 'gridColor')
                  .name('그리드 색상')
                  .onChange(() => {
                      if (this.imageLoaded && this.currentMode === 'pixel') {
                          this.renderImage();
                      }
                  });
        gridFolder.add(this.settings, 'gridWidth', 0.5, 5)
                  .name('그리드 두께')
                  .onChange(() => {
                      if (this.imageLoaded && this.currentMode === 'pixel') {
                          this.renderImage();
                      }
                  });
        
        // 도트 설정
        const dotFolder = gui.addFolder('도트 설정');
        dotFolder.addColor(this.settings, 'dotColor')
                 .name('도트 색상')
                 .onChange(() => {
                     if (this.imageLoaded && this.currentMode === 'pixel') {
                         this.renderImage();
                     }
                 });
        dotFolder.add(this.settings, 'dotSize', 1, 20)
                 .name('도트 크기')
                 .onChange(() => {
                     if (this.imageLoaded && this.currentMode === 'pixel') {
                         this.renderImage();
                     }
                 });
        
        // 내보내기 설정
        const exportFolder = gui.addFolder('내보내기 설정');
        exportFolder.add(this.settings, 'exportQuality', 0.1, 1.0)
                    .name('품질')
                    .onChange(() => {
                        // 품질 변경은 내보내기 시에만 적용됨
                    });
        exportFolder.add(this.settings, 'exportScale', 0.5, 4.0)
                    .name('크기 배율')
                    .onChange(() => {
                        // 크기 배율 변경은 내보내기 시에만 적용됨
                    });
        
        pixelFolder.open();
        effectsFolder.open();
        gridFolder.open();
        dotFolder.open();
        exportFolder.open();
    }
    
    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.imageLoaded = true;
                this.resizeCanvas();
                this.renderImage();
                this.showMessage('이미지가 성공적으로 로드되었습니다!', 'success');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    async pasteFromClipboard() {
        try {
            const clipboardItems = await navigator.clipboard.read();
            for (const clipboardItem of clipboardItems) {
                for (const type of clipboardItem.types) {
                    if (type.startsWith('image/')) {
                        const blob = await clipboardItem.getType(type);
                        this.loadImageFromBlob(blob);
                        return;
                    }
                }
            }
            this.showMessage('클립보드에 이미지가 없습니다.', 'error');
        } catch (error) {
            console.error('클립보드 접근 오류:', error);
            this.showMessage('클립보드 접근이 거부되었습니다. 브라우저 설정을 확인해주세요.', 'error');
        }
    }
    
    handlePasteEvent(e) {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
                const blob = items[i].getAsFile();
                this.loadImageFromBlob(blob);
                return;
            }
        }
        this.showMessage('클립보드에 이미지가 없습니다.', 'error');
    }
    
    loadImageFromBlob(blob) {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            this.originalImage = img;
            this.imageLoaded = true;
            this.resizeCanvas();
            this.renderImage();
            URL.revokeObjectURL(url); // 메모리 정리
            this.showMessage('이미지가 성공적으로 로드되었습니다!', 'success');
        };
        img.src = url;
    }
    
    showMessage(message, type = 'info') {
        this.toast.textContent = message;
        this.toast.className = `toast show ${type}`;
        
        // 3초 후 자동으로 숨기기
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
    
    setMode(mode) {
        this.currentMode = mode;
        
        // 버튼 상태 업데이트
        this.originalBtn.classList.toggle('active', mode === 'original');
        this.pixelBtn.classList.toggle('active', mode === 'pixel');
        
        // 모바일 버튼 텍스트 업데이트
        if (this.mobileModeBtn) {
            this.mobileModeBtn.textContent = mode === 'original' ? '픽셀화' : '원본';
        }
        
        // 이미지 렌더링
        if (this.imageLoaded) {
            this.renderImage();
        }
        
        // 모드 변경 메시지
        const modeText = mode === 'original' ? '원본' : '픽셀화';
        this.showMessage(`${modeText} 모드로 변경되었습니다.`);
    }

    setGridMode(mode) {
        this.currentGridMode = mode;
        
        // 버튼 상태 업데이트
        this.noGridBtn.classList.toggle('active', mode === 'none');
        this.gridBtn.classList.toggle('active', mode === 'grid');
        this.dotBtn.classList.toggle('active', mode === 'dot');
        
        // 모바일 버튼 텍스트 업데이트
        if (this.mobileGridBtn) {
            const modeTexts = {
                'none': '그리드 없음',
                'grid': '그리드',
                'dot': '도트'
            };
            this.mobileGridBtn.textContent = modeTexts[mode] || '그리드 모드';
        }

        // 이미지 렌더링
        if (this.imageLoaded) {
            this.renderImage();
        }
        
        // 그리드 모드 변경 메시지
        const modeText = mode === 'none' ? '그리드 없음' : mode === 'grid' ? '그리드' : '도트';
        this.showMessage(`${modeText} 모드로 변경되었습니다.`);
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const maxWidth = container.clientWidth - 40;
        const maxHeight = container.clientHeight - 40;
        
        if (this.originalImage) {
            // 이미지 비율 유지하면서 캔버스 크기 조정
            const imgRatio = this.originalImage.width / this.originalImage.height;
            const containerRatio = maxWidth / maxHeight;
            
            if (imgRatio > containerRatio) {
                this.canvas.width = maxWidth;
                this.canvas.height = maxWidth / imgRatio;
            } else {
                this.canvas.height = maxHeight;
                this.canvas.width = maxHeight * imgRatio;
            }
        } else {
            // 플레이스홀더용 크기
            this.canvas.width = Math.min(800, maxWidth);
            this.canvas.height = Math.min(600, maxHeight);
        }
    }
    
    showPlaceholder() {
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#666';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('이미지를 업로드해주세요', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = '#888';
        this.ctx.fillText('위의 "이미지 업로드" 버튼을 클릭하세요', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
    
    renderImage() {
        if (!this.originalImage) return;
        
        // 캔버스 클리어
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.currentMode === 'original') {
            this.renderOriginalImage();
        } else {
            this.renderPixelatedImage();
        }
    }
    
    renderOriginalImage() {
        // 원본 이미지를 캔버스에 그리기
        this.ctx.drawImage(this.originalImage, 0, 0, this.canvas.width, this.canvas.height);
        
        // 이미지 효과 적용
        this.applyImageEffects();
    }
    
    renderPixelatedImage() {
        const pixelSize = this.settings.pixelSize;
        const imgWidth = this.canvas.width;
        const imgHeight = this.canvas.height;
        
        // 임시 캔버스 생성 (원본 이미지용)
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = imgWidth;
        tempCanvas.height = imgHeight;
        
        // 임시 캔버스의 이미지 스무딩도 비활성화
        tempCtx.imageSmoothingEnabled = false;
        tempCtx.imageSmoothingQuality = 'low';
        
        // 원본 이미지를 임시 캔버스에 그리기
        tempCtx.drawImage(this.originalImage, 0, 0, imgWidth, imgHeight);
        
        // 이미지 효과 적용
        this.applyImageEffects(tempCtx, tempCanvas);
        
        // 정확한 픽셀 블록 크기 계산
        const scaledDownWidth = Math.ceil(imgWidth / pixelSize);
        const scaledDownHeight = Math.ceil(imgHeight / pixelSize);
        
        // 실제 픽셀 블록 크기 (마지막 블록이 잘릴 수 있음)
        const actualPixelWidth = imgWidth / scaledDownWidth;
        const actualPixelHeight = imgHeight / scaledDownHeight;
        
        // 축소된 캔버스 생성
        const scaledCanvas = document.createElement('canvas');
        const scaledCtx = scaledCanvas.getContext('2d');
        scaledCanvas.width = scaledDownWidth;
        scaledCanvas.height = scaledDownHeight;
        
        // 이미지 스무딩 비활성화
        scaledCtx.imageSmoothingEnabled = false;
        scaledCtx.imageSmoothingQuality = 'low';
        
        // 원본 이미지를 축소된 크기로 그리기 (픽셀화 효과)
        scaledCtx.drawImage(tempCanvas, 0, 0, scaledDownWidth, scaledDownHeight);
        
        // 축소된 이미지를 원본 크기로 확대 (픽셀화 완성)
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.imageSmoothingQuality = 'low';
        this.ctx.drawImage(scaledCanvas, 0, 0, imgWidth, imgHeight);
        
        // 그리드 또는 도트 그리기 (실제 픽셀 블록 크기 사용)
        if (this.currentGridMode === 'grid') {
            this.drawGrid(actualPixelWidth, actualPixelHeight, imgWidth, imgHeight, scaledDownWidth, scaledDownHeight);
        } else if (this.currentGridMode === 'dot') {
            this.drawDots(actualPixelWidth, actualPixelHeight, imgWidth, imgHeight, scaledDownWidth, scaledDownHeight);
        }
    }
    
    applyImageEffects(ctx = this.ctx, canvas = this.canvas) {
        const brightness = this.settings.brightness;
        const contrast = this.settings.contrast;
        const saturation = this.settings.saturation;
        
        // 효과가 기본값이면 적용하지 않음
        if (brightness === 1.0 && contrast === 1.0 && saturation === 1.0) {
            return;
        }
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            
            // 밝기 조정
            if (brightness !== 1.0) {
                r = Math.min(255, Math.max(0, r * brightness));
                g = Math.min(255, Math.max(0, g * brightness));
                b = Math.min(255, Math.max(0, b * brightness));
            }
            
            // 대비 조정
            if (contrast !== 1.0) {
                const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
                r = Math.min(255, Math.max(0, factor * (r - 128) + 128));
                g = Math.min(255, Math.max(0, factor * (g - 128) + 128));
                b = Math.min(255, Math.max(0, factor * (b - 128) + 128));
            }
            
            // 채도 조정
            if (saturation !== 1.0) {
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                r = Math.min(255, Math.max(0, gray + saturation * (r - gray)));
                g = Math.min(255, Math.max(0, gray + saturation * (g - gray)));
                b = Math.min(255, Math.max(0, gray + saturation * (b - gray)));
            }
            
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    drawGrid(actualPixelWidth, actualPixelHeight, imgWidth, imgHeight, scaledDownWidth, scaledDownHeight) {
        this.ctx.strokeStyle = this.settings.gridColor;
        this.ctx.lineWidth = this.settings.gridWidth;
        this.ctx.beginPath();
        
        // 세로선 그리기 (실제 픽셀 블록 경계에 맞춤)
        for (let i = 1; i < scaledDownWidth; i++) {
            const x = i * actualPixelWidth;
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, imgHeight);
        }
        
        // 가로선 그리기 (실제 픽셀 블록 경계에 맞춤)
        for (let i = 1; i < scaledDownHeight; i++) {
            const y = i * actualPixelHeight;
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(imgWidth, y);
        }
        
        this.ctx.stroke();
    }
    
    drawDots(actualPixelWidth, actualPixelHeight, imgWidth, imgHeight, scaledDownWidth, scaledDownHeight) {
        this.ctx.fillStyle = this.settings.dotColor;
        
        // 그리드 교차점에 도트 그리기 (실제 픽셀 블록 경계에 맞춤)
        for (let i = 1; i < scaledDownHeight; i++) {
            for (let j = 1; j < scaledDownWidth; j++) {
                const x = j * actualPixelWidth;
                const y = i * actualPixelHeight;
                const dotRadius = this.settings.dotSize / 2;
                this.ctx.beginPath();
                this.ctx.arc(x, y, dotRadius, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        }
    }

    toggleExportDropdown() {
        this.exportDropdown.classList.toggle('show');
    }
    
    hideExportDropdown() {
        this.exportDropdown.classList.remove('show');
    }
    
    exportImage(format) {
        if (!this.imageLoaded) {
            this.showMessage('내보낼 이미지가 없습니다.', 'error');
            return;
        }
        
        try {
            let dataUrl;
            let filename;
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            
            switch (format) {
                case 'png':
                    dataUrl = this.canvas.toDataURL('image/png');
                    filename = `pixelated-image-${timestamp}.png`;
                    break;
                    
                case 'jpeg':
                    dataUrl = this.canvas.toDataURL('image/jpeg', this.settings.exportQuality);
                    filename = `pixelated-image-${timestamp}.jpg`;
                    break;
                    
                case 'webp':
                    dataUrl = this.canvas.toDataURL('image/webp', this.settings.exportQuality);
                    filename = `pixelated-image-${timestamp}.webp`;
                    break;
                    
                case 'svg':
                    dataUrl = this.canvasToSVG();
                    filename = `pixelated-image-${timestamp}.svg`;
                    break;
                    
                default:
                    this.showMessage('지원하지 않는 포맷입니다.', 'error');
                    return;
            }
            
            // 고해상도 내보내기
            if (this.settings.exportScale !== 1.0) {
                dataUrl = this.exportHighResolution(format);
            }
            
            this.downloadFile(dataUrl, filename);
            this.showMessage(`${format.toUpperCase()} 형식으로 내보내기가 완료되었습니다!`, 'success');
            
        } catch (error) {
            console.error('내보내기 오류:', error);
            this.showMessage('내보내기 중 오류가 발생했습니다.', 'error');
        }
    }
    
    exportHighResolution(format) {
        const scale = this.settings.exportScale;
        const originalWidth = this.canvas.width;
        const originalHeight = this.canvas.height;
        
        // 고해상도 캔버스 생성
        const highResCanvas = document.createElement('canvas');
        const highResCtx = highResCanvas.getContext('2d');
        highResCanvas.width = originalWidth * scale;
        highResCanvas.height = originalHeight * scale;
        
        // 고해상도 캔버스 설정
        highResCtx.imageSmoothingEnabled = false;
        highResCtx.imageSmoothingQuality = 'low';
        
        // 현재 캔버스 내용을 고해상도로 복사
        highResCtx.drawImage(this.canvas, 0, 0, highResCanvas.width, highResCanvas.height);
        
        // 고해상도 이미지 데이터 URL 생성
        switch (format) {
            case 'png':
                return highResCanvas.toDataURL('image/png');
            case 'jpeg':
                return highResCanvas.toDataURL('image/jpeg', this.settings.exportQuality);
            case 'webp':
                return highResCanvas.toDataURL('image/webp', this.settings.exportQuality);
            case 'svg':
                return this.canvasToSVG(scale);
            default:
                return highResCanvas.toDataURL('image/png');
        }
    }
    
    canvasToSVG(scale = 1.0) {
        const width = this.canvas.width * scale;
        const height = this.canvas.height * scale;
        
        // SVG 문자열 생성
        const svgData = this.canvas.toDataURL('image/png');
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                <image href="${svgData}" width="${width}" height="${height}"/>
            </svg>
        `;
        
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    }
    
    downloadFile(dataUrl, filename) {
        this.downloadLink.href = dataUrl;
        this.downloadLink.download = filename;
        this.downloadLink.click();
    }
}

// 애플리케이션 시작
document.addEventListener('DOMContentLoaded', () => {
    new ImagePixelizer();
}); 