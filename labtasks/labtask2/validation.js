const form = document.getElementById('checkoutForm');

  const fields = [
    { id: "fullName", errorId: "fullNameError", message: "Please enter a valid full name (letters and spaces only)." },
    { id: "email", errorId: "emailError", message: "Please enter a valid email address." },
    { id: "phone", errorId: "phoneError", message: "Phone number must be 10 to 15 digits." },
    { id: "address", errorId: "addressError", message: "Address is required." },
    { id: "cardNumber", errorId: "cardError", message: "Card number must be 16 digits." },
    { id: "expiryDate", errorId: "expiryError", message: "Please select a future expiry date." },
    { id: "cvv", errorId: "cvvError", message: "CVV must be 3 digits." },
  ];

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    let isFormValid = true;

    fields.forEach(field => {
      const input = document.getElementById(field.id);
      const error = document.getElementById(field.errorId);

      input.classList.remove('is-invalid');
      error.textContent = '';

      if (!input.checkValidity()) {
        input.classList.add('is-invalid');
        error.textContent = field.message;
        isFormValid = false;
      }

      // Additional custom check for expiry date
      if (field.id === "expiryDate" && input.value) {
        const now = new Date();
        const selected = new Date(input.value + "-01");
        if (selected < now) {
          input.classList.add('is-invalid');
          error.textContent = "Expiry date must be in the future.";
          isFormValid = false;
        }
      }
    });

    if (isFormValid) {
      alert("Form submitted successfully!");
      form.reset();
      fields.forEach(f => {
        document.getElementById(f.id).classList.remove("is-invalid");
        document.getElementById(f.errorId).textContent = '';
      });
    }
  });