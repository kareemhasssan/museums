
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        if (this.getAttribute('href') == 'index.html') { // منع الانتقال الافتراضي إلى العناصر في نفس الصفحة
            e.preventDefault();
            window.location.href = this.getAttribute('href'); // الانتقال إلى الصفحة المحددة
        }
        else{
            e.preventDefault(); // منع الانتقال الافتراضي
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth' // تفعيل الانتقال السلس
            });
        }
    });
});