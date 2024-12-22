document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registration-form");

    form.addEventListener("submit", function (event) {
        const fields = [
            { id: "lastName", validationId: "lastNameValidation", validator: validateRequired, message: "Last Name is required." },
            { id: "firstName", validationId: "firstNameValidation", validator: validateRequired, message: "First Name is required." },
            { id: "gender", validationId: "genderValidation", validator: validateGender, message: "Please select a gender." },
            { id: "email", validationId: "emailValidation", validator: validateEmail, message: "Please enter a valid email address." },
            { id: "password", validationId: "passwordValidation", validator: validatePassword, message: "Password must contain at least 8 characters, 1 capital letter, 1 number, and 1 special character." },
            { id: "confirmPassword", validationId: "confirmPasswordValidation", validator: validateConfirmPassword, message: "Passwords do not match." }
        ];

        let isValid = true;
        for (const field of fields) {
            const input = document.getElementById(field.id);
            const validation = document.getElementById(field.validationId);
            const isFieldValid = field.validator(input, validation, field.message);
            if (!isFieldValid) {
                isValid = false;
                break; // Stop validation on the first error
            }
        }

        if (!isValid) {
            event.preventDefault();
        }
    });

    function validateRequired(input, validation, message) {
        if (input.value.trim() === "") {
            showErrorMessage(validation, "!error: " + message);
            return false;
        } else {
            hideErrorMessage(validation);
            return true;
        }
    }

    function validateGender(input, validation, message) {
        const maleRadioButton = document.querySelector('input[name="gender"][value="male"]');
        const femaleRadioButton = document.querySelector('input[name="gender"][value="female"]');

        if (!maleRadioButton.checked && !femaleRadioButton.checked) {
            showErrorMessage(validation, "!error: " + message);
            return false;
        } else {
            hideErrorMessage(validation);
            return true;
        }
    }

    function validateEmail(input, validation, message) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(input.value.trim())) {
            showErrorMessage(validation, "!error: " + message);
            return false;
        } else {
            hideErrorMessage(validation);
            return true;
        }
    }

    function validatePassword(input, validation, message) {
        const passwordPattern = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;

        if (!passwordPattern.test(input.value)) {
            showErrorMessage(validation, "!error: " + message);
            return false;
        } else {
            hideErrorMessage(validation);
            return true;
        }
    }

    function validateConfirmPassword(passwordInput, confirmPasswordInput, validation, message) {
        if (passwordInput.value !== confirmPasswordInput.value) {
            showErrorMessage(validation, "!error: " + message);
            return false;
        } else {
            hideErrorMessage(validation);
            return true;
        }
    }

    function showErrorMessage(element, message) {
        element.textContent = message;
        element.style.color = "red";
        element.style.display = "block";

    }

    function hideErrorMessage(element) {
        element.textContent = "";
        element.style.display = "none";
    }
});

function goHome(){
    window.location.href = 'index.html';
}

function goProfile(){
    window.location.href = 'profile';
}

function goReservation(){
    window.location.href = 'reservation.html';
}

function openPopup(message) {
    document.getElementById('popup-message').innerText = message;
    document.getElementById('popup-container').style.display = 'block';
  }
  
  function closePopup() {
    document.getElementById('popup-container').style.display = 'none';
  }
  
  function triggerPopup() {
    openPopup('Something happened!');
  }

  function sendmessage() {
    
    let body = document.getElementById("message").value;
    let subject = document.getElementById("subject").value;
    window.open(`mailto:STARX_customerservice@gmail.com?body=${encodeURIComponent(body)}&subject=${encodeURIComponent(subject)}`)
  }

