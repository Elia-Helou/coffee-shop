(function ($) {
    "use strict";
    
    $(document).ready(function () {
        function toggleNavbarMethod() {
            if ($(window).width() > 992) {
                $('.navbar .dropdown').on('mouseover', function () {
                    $('.dropdown-toggle', this).trigger('click');
                }).on('mouseout', function () {
                    $('.dropdown-toggle', this).trigger('click').blur();
                });
            } else {
                $('.navbar .dropdown').off('mouseover').off('mouseout');
            }
        }
        toggleNavbarMethod();
        $(window).resize(toggleNavbarMethod);
    });

    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.back-to-top')
        } else {
            $('.back-to-top')
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });

})(jQuery);

function showErrorMessage(element, message) {
    element.textContent = message;
    element.style.color = "red";
    element.style.display = "block";

}

function redirectToSignup() {
        var emailValue = document.getElementById('emailInput').value;
        window.location.href = 'login.html?email=' + encodeURIComponent(emailValue);
    }

function redirectToCreateAccount(){
    window.location.href = 'createAccount.html?';
}

function goTestimonial(){
    window.location.href = 'testimonial.html';
}

function verifyUser() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessageElement = document.getElementById('errorMessage');

    console.log('Sending email:', email);
    console.log('Sending password:', password);

    fetch('/verifyUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.text())
    .then(result => {
        
        console.log('Result from server:', result);

        if (result === 'Login successful') {
            window.location.href="index.html";
            
        } else {
            showErrorMessage(errorMessageElement, "please enter a valid account")
        }
    })
    .catch(error => console.error('Error:', error));
}
