var emailError = document.getElementById("email-error");
var passwordError = document.getElementById("password-error");
var passwordError2 = document.getElementById("password-error-2");
var submitError = document.getElementById("submit-error");

function validateEmail() {
  var emailField = document.getElementById("form3Example3").value;

  if (emailField.length == 0) {
    emailError.innerHTML = "Email is required";
    emailError.classList.remove("text-success");
    emailError.classList.add("text-danger");
    return false;
  }

  if (!emailField.match(/^[A-Za-z\._\-0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/)) {
    emailError.innerHTML = "Invalid Email";
    emailError.classList.remove("text-success");
    emailError.classList.add("text-danger");
    return false;
  } else {
    emailError.innerHTML = '<i class="fa-solid fa-check"></i>';
    emailError.classList.remove("text-danger");
    emailError.classList.add("text-success");
    return true;
  }
}

function validatePassword() {
  var passwordField = document.getElementById("form3Example4").value;

  var required = 6;

  var left = required - passwordField.length;

  if (left > 0) {
    passwordError.innerHTML = left + "more characters required";
    passwordError.classList.remove("text-success");
    passwordError.classList.add("text-danger");
    return false;
  }
  passwordError.innerHTML = '<i class="fa-solid fa-check"></i>';
  passwordError.classList.remove("text-danger");
  passwordError.classList.add("text-success");
  return true;
}

function validatePassword2() {
  var passwordField = document.getElementById("form3Example5").value;

  var required = 6;

  var left = required - passwordField.length;

  if (left > 0) {
    passwordError2.innerHTML = left + "more characters required";
    passwordError2.classList.remove("text-success");
    passwordError2.classList.add("text-danger");
    return false;
  }
  passwordError2.innerHTML = '<i class="fa-solid fa-check"></i>';
  passwordError2.classList.remove("text-danger");
  passwordError2.classList.add("text-success");
  return true;
}

function validateForm() {
  if (!validateEmail() || !validatePassword()) {
    submitError.innerHTML = "Please fix these error to submit";
    return false;
  }
}
