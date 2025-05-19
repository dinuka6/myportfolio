  // Smooth scrolling for all links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });


        // Add shadow to navbar on scroll
        window.addEventListener('scroll', function() {
            const nav = document.querySelector('nav');
            if (window.scrollY > 50) {
                nav.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.4)';
            } else {
                nav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
            }
        });


        // Animate skill bars when section comes into view
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillBars = entry.target.querySelectorAll('.skill-level');
                skillBars.forEach(bar => {
                    bar.style.width = bar.parentElement.previousElementSibling.textContent + '%';
                });
                skillObserver.unobserve(entry.target);
            }
        });
    }, {threshold: 0.5});
    
    document.querySelectorAll('.skills-category').forEach(category => {
        skillObserver.observe(category);}
    );

    