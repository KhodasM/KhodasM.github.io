document.addEventListener('DOMContentLoaded', () => {
    const galleryItems = document.querySelectorAll('.gallery-item img');
    const popup = document.querySelector('.image-popup');
    const popupImage = document.querySelector('.popup-image');
    const closeBtn = document.querySelector('.close-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const header = document.querySelector('.header');
    const aboutSection = document.querySelector('#about');
    const timeoutPopup = document.querySelector('.timeout-popup');
    const timeoutClose = document.querySelector('.timeout-close');
    const contactBtn = document.querySelector('.contact-btn');
    const contactPopup = document.querySelector('.contact-popup');
    const contactCloseBtn = document.querySelector('.contact-close-btn');
    const contactForm = document.getElementById('popup-form');
    const submitBtn = contactForm.querySelector('.submit-btn');
    const fields = {
        name: document.getElementById('popup-name'),
        email: document.getElementById('popup-email'),
        message: document.getElementById('popup-message')
    };

    function updateSummerTimer() {
        const moscowOffset = 3 * 60 * 60 * 1000;
        const now = new Date();
        const moscowTime = new Date(now.getTime() + moscowOffset);
        
        let summerDate = new Date(Date.UTC(moscowTime.getUTCFullYear(), 5, 1));
        if (moscowTime >= summerDate) {
            summerDate = new Date(Date.UTC(moscowTime.getUTCFullYear() + 1, 5, 1));
        }
        
        const timeDiff = summerDate - moscowTime;
        
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            
        document.getElementById('summerCountdown').innerHTML = 
            `${days}д ${hours}ч ${minutes}м ${seconds}с`;
    }

    const validate = {
        name: value => /^[а-яА-ЯёЁa-zA-Z\s]{2,}$/.test(value.trim()),
        email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: value => /^[а-яА-ЯёЁa-zA-Z0-9\s.,!?()-]{10,}$/.test(value.trim())
    };

    function getErrorMessage(field) {
        const messages = {
            name: 'Имя должно содержать только буквы (минимум 2)',
            email: 'Введите корректный email',
            message: 'Сообщение должно содержать только буквы и знаки препинания (минимум 10 символов)'
        };
        return messages[field];
    }

    function initEventListeners() {
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                currentIndex = index;
                updatePopup();
                popup.style.display = 'flex';
            });
        });

        closeBtn.addEventListener('click', closePopup);
        popup.addEventListener('click', (e) => {
            if(e.target === popup) closePopup();
        });

        prevBtn.addEventListener('click', showPrev);
        nextBtn.addEventListener('click', showNext);

        window.addEventListener('scroll', toggleStickyHeader);
        window.addEventListener('resize', toggleStickyHeader);

        if(!localStorage.getItem('popupClosed')) {
            setTimeout(() => {
                timeoutPopup.style.display = 'flex';
            }, 30000);
        }

        timeoutClose.addEventListener('click', () => {
            timeoutPopup.style.display = 'none';
            localStorage.setItem('popupClosed', 'true');
        });

        timeoutPopup.addEventListener('click', (e) => {
            if(e.target === timeoutPopup) {
                timeoutPopup.style.display = 'none';
                localStorage.setItem('popupClosed', 'true');
            }
        });

        contactBtn.addEventListener('click', () => {
            contactPopup.classList.add('show');
        });

        contactCloseBtn.addEventListener('click', () => {
            contactPopup.classList.remove('show');
        });

        contactPopup.addEventListener('click', (e) => {
            if(e.target === contactPopup) {
                contactPopup.classList.remove('show');
            }
        });

        Object.keys(fields).forEach(field => {
            fields[field].addEventListener('input', function() {
                const errorElement = this.nextElementSibling;
                if(validate[field](this.value)) {
                    errorElement.textContent = '';
                    this.classList.remove('invalid');
                } else {
                    this.classList.add('invalid');
                }
            });
        });

        contactForm.addEventListener('submit', handleFormSubmit);
        
        document.addEventListener('keydown', (e) => {
            if(popup.style.display === 'flex') {
                if(e.key === 'Escape') closePopup();
                if(e.key === 'ArrowLeft') showPrev();
                if(e.key === 'ArrowRight') showNext();
            }
        });
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        
        let isValid = true;
        Object.keys(fields).forEach(field => {
            const errorElement = fields[field].nextElementSibling;
            if(!validate[field](fields[field].value)) {
                errorElement.textContent = getErrorMessage(field);
                fields[field].classList.add('invalid');
                isValid = false;
            }
        });

        if(!isValid) return;

        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Отправляем...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('https://formspree.io/f/mnndynlv', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: fields.name.value,
                    email: fields.email.value,
                    message: fields.message.value
                })
            });

            if(response.ok) {
                submitBtn.textContent = '✓ Успешно отправлено!';
                submitBtn.style.backgroundColor = '#4CAF50';
                setTimeout(() => {
                    contactPopup.classList.remove('show');
                    submitBtn.textContent = originalBtnText;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.disabled = false;
                    contactForm.reset();
                }, 2000);
            }
        } catch (error) {
            console.error('Ошибка отправки:', error);
            submitBtn.textContent = 'Ошибка отправки';
            setTimeout(() => {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }, 2000);
        }
    }

    let currentIndex = 0;
    const images = Array.from(galleryItems).map(item => item.src);

    function updatePopup() {
        popupImage.src = images[currentIndex];
        prevBtn.style.visibility = currentIndex > 0 ? 'visible' : 'hidden';
        nextBtn.style.visibility = currentIndex < images.length - 1 ? 'visible' : 'hidden';
    }

    function showPrev() {
        if(currentIndex > 0) {
            currentIndex--;
            updatePopup();
        }
    }

    function showNext() {
        if(currentIndex < images.length - 1) {
            currentIndex++;
            updatePopup();
        }
    }

    function closePopup() {
        popup.style.display = 'none';
    }

    function toggleStickyHeader() {
        const headerHeight = header.offsetHeight;
        const aboutSectionTop = aboutSection.offsetTop - headerHeight * 2;
        
        if (window.scrollY >= aboutSectionTop) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    }

    initEventListeners();
    toggleStickyHeader();
    updateSummerTimer();
    setInterval(updateSummerTimer, 1000);

    const path = document.querySelector('.draw-path');
    if(path) {
        const pathLength = path.getTotalLength();
  
        function updatePathAnimation() {
            const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = window.scrollY;
            
            const progress = Math.min(scrolled / scrollableHeight, 1);
            
            const drawLength = pathLength * progress;
            path.style.strokeDashoffset = pathLength - drawLength;
            
            path.style.opacity = 1 - progress * 0.5;
        }

        path.style.strokeDasharray = pathLength;
        path.style.strokeDashoffset = pathLength;
        
        let isScrolling;
        window.addEventListener('scroll', () => {
            window.cancelAnimationFrame(isScrolling);
            isScrolling = window.requestAnimationFrame(updatePathAnimation);
        });

        updatePathAnimation();
    }
});
