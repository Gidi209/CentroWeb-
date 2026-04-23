// ============================================
// CENTRO DE FORMAÇÃO WEB - APP.JS (CORRIGIDO)
// ============================================

// Aguardar DOM completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('[APP] Inicializando...');

    // 1. ANIMAÇÃO DE CONTADORES
    const animateNumbers = () => {
        const counters = document.querySelectorAll('.stat-num[data-count]');
        
        const animateCounter = (counter) => {
            const target = parseInt(counter.getAttribute('data-count'));
            let current = 0;
            const increment = target / 50;
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            updateCounter();
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => observer.observe(counter));
    };
    animateNumbers();

    // 2. COUNTDOWN PARA PRÓXIMA TURMA
    const startCountdown = () => {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 31);
        targetDate.setHours(0, 0, 0, 0);
        
        const updateCountdown = () => {
            const now = new Date();
            const diff = targetDate - now;
            
            if (diff <= 0) {
                document.getElementById('countdown').textContent = 'HOJE!';
                return;
            }
            
            const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
            document.getElementById('countdown').textContent = `${days} ${days === 1 ? 'dia' : 'dias'}`;
        };
        
        updateCountdown();
        setInterval(updateCountdown, 3600000); // Atualizar a cada hora
    };
    startCountdown();

    // 3. CONTADOR DE VAGAS (Simulado)
    let vagasRestantes = 10;
    const vagasText = document.getElementById('vagasText');
    if (vagasText) {
        setInterval(() => {
            if (vagasRestantes > 1 && Math.random() > 0.7) {
                vagasRestantes--;
                vagasText.textContent = `⏰ Apenas ${vagasRestantes} ${vagasRestantes === 1 ? 'vaga' : 'vagas'} restantes! Inscreva-se já`;
            }
        }, 30000);
    }

    // 4. PWA - INSTALAÇÃO
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const installBtn = document.getElementById('installBtn');
        if (installBtn) installBtn.style.display = 'inline-block';
        console.log('[PWA] Pronto para instalar');
    });
    
    document.getElementById('installBtn')?.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`[PWA] Instalação: ${outcome}`);
            deferredPrompt = null;
            document.getElementById('installBtn').style.display = 'none';
        }
    });
    
    window.addEventListener('appinstalled', () => {
        console.log('[PWA] App instalada!');
        document.getElementById('installBtn').style.display = 'none';
    });

    // 5. OFFLINE DETECTION
    const offlineBanner = document.getElementById('offlineBanner');
    
    const updateOfflineStatus = () => {
        if (offlineBanner) {
            offlineBanner.style.display = navigator.onLine ? 'none' : 'block';
        }
    };
    
    window.addEventListener('online', updateOfflineStatus);
    window.addEventListener('offline', updateOfflineStatus);
    updateOfflineStatus();

    // 6. SERVICE WORKER REGISTRATION
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('[SW] Registrado com sucesso:', reg.scope))
            .catch(err => console.error('[SW] Erro:', err));
    }

    // 7. FORM VALIDATION
    const form = document.getElementById('enrollForm');
    
    const validateName = (name) => name.length >= 3;
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    const validateWhatsApp = (whatsapp) => /^[0-9]{9,12}$/.test(whatsapp.replace(/\D/g, ''));
    const validateExperience = (exp) => exp !== '';
    const validateTerms = (terms) => terms === true;
    
    const showError = (fieldId, message) => {
        const field = document.getElementById(fieldId);
        const errorEl = document.getElementById(`${fieldId}Error`);
        if (field) field.classList.add('error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('show');
        }
    };
    
    const clearError = (fieldId) => {
        const field = document.getElementById(fieldId);
        const errorEl = document.getElementById(`${fieldId}Error`);
        if (field) field.classList.remove('error');
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.remove('show');
        }
    };
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const whatsapp = document.getElementById('whatsapp').value.trim();
            const experience = document.getElementById('experience').value;
            const terms = document.getElementById('terms').checked;
            
            let isValid = true;
            
            if (!validateName(name)) {
                showError('name', 'Nome deve ter pelo menos 3 caracteres');
                isValid = false;
            } else clearError('name');
            
            if (!validateEmail(email)) {
                showError('email', 'E-mail inválido (ex: nome@dominio.com)');
                isValid = false;
            } else clearError('email');
            
            if (!validateWhatsApp(whatsapp)) {
                showError('whatsapp', 'Número inválido. Use apenas números (ex: 923456789)');
                isValid = false;
            } else clearError('whatsapp');
            
            if (!validateExperience(experience)) {
                showError('experience', 'Selecione seu nível de experiência');
                isValid = false;
            } else clearError('experience');
            
            if (!validateTerms(terms)) {
                showError('terms', 'Você precisa aceitar os termos');
                isValid = false;
            } else clearError('terms');
            
            if (!isValid) return;
            
            // Envio do formulário
            const submitBtn = document.getElementById('submitBtn');
            const btnText = document.getElementById('btnText');
            const btnLoader = document.getElementById('btnLoader');
            const successMsg = document.getElementById('successMsg');
            
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline';
            
            try {
                // Simular envio para API/localStorage
                await new Promise(resolve => setTimeout(resolve, 1200));
                
                // Salvar no localStorage
                const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
                enrollments.push({
                    id: Date.now(),
                    name,
                    email,
                    whatsapp: whatsapp.replace(/\D/g, ''),
                    experience,
                    date: new Date().toISOString()
                });
                localStorage.setItem('enrollments', JSON.stringify(enrollments));
                
                // Mostrar sucesso
                form.style.display = 'none';
                successMsg.style.display = 'block';
                
                // Redirecionar para WhatsApp
                const formattedPhone = '244954695732';
                const message = `Olá! Meu nome é ${encodeURIComponent(name)}. Quero me inscrever no curso de Programação Web. Meu email é ${encodeURIComponent(email)}. Sou ${experience === 'zero' ? 'iniciante' : experience === 'beginner' ? 'com alguma experiência' : 'já programo'}. Confirme minha inscrição!`;
                const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`;
                
                setTimeout(() => {
                    window.open(whatsappUrl, '_blank');
                }, 800);
                
            } catch (error) {
                console.error('[FORM] Erro:', error);
                alert('Erro ao enviar. Tente novamente ou contacte-nos diretamente.');
                submitBtn.disabled = false;
                btnText.style.display = 'inline';
                btnLoader.style.display = 'none';
            }
        });
    }

    // 8. BOTÃO DE CONTATO
    const contactBtn = document.getElementById('contactBtn');
    if (contactBtn) {
        contactBtn.addEventListener('click', () => {
            const phone = '+244974926753';
            window.open(`tel:${phone}`, '_blank');
        });
    }

    // 9. SCROLL ANIMATIONS
    const animatedElements = document.querySelectorAll('.card, .testimonial, .course-box, .stat');
    
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
                animationObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    
    animatedElements.forEach(el => animationObserver.observe(el));

    // 10. EFEITO DE GLOW DINÂMICO
    const glowCards = document.querySelectorAll('.card, .testimonial, .course-box');
    
    glowCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--x', `${x}%`);
            card.style.setProperty('--y', `${y}%`);
            
            const intensity = Math.min(30, Math.abs(50 - x) / 2);
            card.style.boxShadow = `0 0 ${intensity}px rgba(0, 255, 255, 0.2)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.boxShadow = '';
        });
    });

    // 11. SMOOTH SCROLL PARA LINKS ÂNCORA
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    console.log('[APP] Inicialização concluída!');
});