import { is_mobile } from "./_functions.js";
document.addEventListener("DOMContentLoaded", () => {
    const classOpen = "open";
    const duration = 300;

    $(".faq-question").on("click", function () {
        const parent = $(this).parent();
        const answer = parent.find(".faq-answer");

        if (parent.hasClass(classOpen)) {
            parent.removeClass(classOpen);
            answer.slideUp(duration);

            setTimeout(() => {
                answer.removeClass(classOpen);
            }, duration);
        } else {
            parent.addClass(classOpen);
            answer.slideDown(duration);

            setTimeout(() => {
                answer.addClass(classOpen);
            }, duration);
        }
    });
});
