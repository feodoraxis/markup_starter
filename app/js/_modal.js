import { modal_open, modal_close } from "./_functions.js";

document.addEventListener("DOMContentLoaded", () => {
    $("[data-modal-selector]").on("click", function (e) {
        e.preventDefault();

        modal_open($(this).attr("data-modal-selector"));
    });

    $(".modal .close").on("click", function () {
        modal_close(`#${$(this).closest(".modal").attr("id")}`);
    });

    $(".modal").on("click", function (e) {
        if (
            $(".modal-window").is(e.target) ||
            $(".modal-window").has(e.target).length !== 0
        ) {
            return;
        }

        const id = $(this).closest(".modal").attr("id");
        modal_close(`#${id}`);
    });

    $(".js-close-modal").on("click", function (e) {
        const id = $(this).closest(".modal").attr("id");

        modal_close(`#${id}`);
    });

    $(document).keydown(function (e) {
        if (e.keyCode !== 27 || !$(".modal.open").length) {
            return;
        }

        modal_close(`#${$(".modal.open").attr("id")}`);
    });
});
