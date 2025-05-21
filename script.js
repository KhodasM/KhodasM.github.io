document.addEventListener('DOMContentLoaded', () => {
    const galleryItems = document.querySelectorAll('.gallery-item img');
    const popup = document.querySelector('.image-popup');
    const popupImage = document.querySelector('.popup-image');
    const closeBtn = document.querySelector('.close-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    let currentIndex = 0;
    const images = Array.from(galleryItems).map(item => item.src);

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

    document.addEventListener('keydown', (e) => {
        if(popup.style.display === 'flex') {
            if(e.key === 'Escape') closePopup();
            if(e.key === 'ArrowLeft') showPrev();
            if(e.key === 'ArrowRight') showNext();
        }
    });

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

    function updateSummerTimer() {
        const moscowOffset = 3 * 60 * 60 * 1000; // MSK UTC+3
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
    
    updateSummerTimer();
    setInterval(updateSummerTimer, 1000);
});