function OverrideCall() {
    LazyLoadInit();
}

function LazyLoadInit() {
    new LazyLoad({
        elements_selector: "img:not(.loaded)",
        load_delay: 1000,
    });
}


(function($) {
    LazyLoadInit();
    let isShow = true;
    document.addEventListener('scroll', () => {
        const checkShow = $('#track-nav').visible(false, false, 'both');
        console.debug(checkShow);
        if (!checkShow) {
            if (isShow) {
                isShow = false;
                $('#nav-toggle, nav#access').addClass('mobile-show');
            }
        } else {
            if (!isShow) {
                isShow = true;
                $('#nav-toggle, nav#access').removeClass('mobile-show');
            }
        }
    })
})(jQuery);
