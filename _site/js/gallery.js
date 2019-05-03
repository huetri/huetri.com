if (!window.__GALLERY__) {
    window.__GALLERY__ = true;

    function loadGallery(gallery) {
        const galleryItems = [].slice.call(gallery.querySelectorAll('.gallery-item'));
        const galleryModal = gallery.querySelector('.gallery-modal');
        const leftBtn = gallery.querySelector('.gallery-modal-control-left');
        const rightBtn = gallery.querySelector('.gallery-modal-control-right');

        function galleryKeyBoardHandle(ev) {
            if (ev.key === 'ArrowLeft') {
                leftBtn.click();
            } else if (ev.key === 'ArrowRight') {
                rightBtn.click();
            } else if (ev.key === 'Escape') {
                gallery.querySelector(".gallery-modal-close").click();
            }
        }

        galleryItems.forEach((item, index) => {
            item.addEventListener('click', ()=>{
                galleryModal.style.setProperty('--item', '' + index);
                galleryModal.classList.add('show');
                galleryModal.id = '';
                document.addEventListener('keydown', galleryKeyBoardHandle);
            });
        });

        gallery.querySelector(".gallery-modal-close").addEventListener('click', () => {
            galleryModal.classList.remove('show');
            document.removeEventListener('keydown', galleryKeyBoardHandle);
        });

        leftBtn.addEventListener('click', () => {
            let current = +galleryModal.style.getPropertyValue('--item');
            if (current > 0) --current;
            galleryModal.style.setProperty('--item', '' + current);
        })
        rightBtn.addEventListener('click', () => {
            let current = +galleryModal.style.getPropertyValue('--item');
            if (current < galleryItems.length - 1) ++current;
            galleryModal.style.setProperty('--item', '' + current);
        });
    }

    document.addEventListener('DOMContentLoaded', ()=>{
        document.querySelectorAll('.gallery').forEach(gal=>loadGallery(gal));
    });
}