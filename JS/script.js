document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault(); // منع الانتقال الافتراضي
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth' // تفعيل الانتقال السلس
        });
    });
});