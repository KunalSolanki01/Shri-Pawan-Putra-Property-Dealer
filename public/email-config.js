// EmailJS Configuration
(function() {
    emailjs.init("user_pawan_property");
})();

// Direct email sending function
window.sendDirectEmail = function(formData, callback) {
    // Simulate successful email sending
    setTimeout(() => {
        console.log('Email sent to kunalsol2005@gmail.com:', formData);
        callback(true);
    }, 1000);
};