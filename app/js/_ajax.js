document.addEventListener("DOMContentLoaded", () => {
    if ($(".js-quiz-form").length) {
        const quizForm = $(".js-quiz-form");

        quizForm.on("submit", function (e) {
            e.preventDefault();

            const quizButton = $(this).find("button");
            const quiz = $(this).closest(".js-quiz");
            const quizBody = $(this).closest(".js-quiz-body");

            $.ajax({
                type: "POST",
                url: "/wp-admin/admin-ajax.php",
                dataType: "json",
                data: quizForm.serialize() + "&action=get_answer",
                beforeSend: function (xhr) {
                    quizButton.attr("disabled", "disabled");
                },
                error: function (request, status, error) {
                    // обрабатываем ошибки
                    if (status == 500) {
                        alert("Ошибка при добавлении ответа");
                    } else if (status == "timeout") {
                        alert(
                            "Ошибка: Сервер не отвечает. Попробуйте ещё, или напишите в поддержку."
                        );
                    } else {
                        const errormsg = request.responseText;
                        const string1 = errormsg.split("<p>");
                        const string2 = string1[1].split("</p>");
                        alert(string2[0]);
                    }
                },
                success: function (result) {
                    quizBody.detach();
                    quizButton.detach();

                    const quizResult = makeQuizResult(result.percents);

                    const mainCountAnswersContainerHTML =
                        document.createElement("div");
                    mainCountAnswersContainerHTML.classList = "quiz-footer";

                    const mainCountAnswersHTML = document.createElement("p");
                    mainCountAnswersHTML.textContent = plural_format_word(
                        result.general_count,
                        ["голос", "голоса", "голосов"]
                    );

                    mainCountAnswersContainerHTML.append(mainCountAnswersHTML);

                    quiz.append(quizResult);
                    quiz.append(mainCountAnswersContainerHTML);
                },
            });

            return false;
        });
    }

    const makeQuizResult = (percents) => {
        const result = document.createElement("div");
        result.classList = "quiz-result";

        console.log(percents);

        for (let title in percents) {
            result.append(makeQuizResultItem(title, percents[title]));
        }

        // percents.forEach((percent, title) => {
        //     result.append( makeQuizResultItem( title, percent ) );
        // });

        return result;
    };

    const makeQuizResultItem = (title, percent) => {
        const itemHTML = document.createElement("div");
        itemHTML.classList = "quiz-answer_result";

        const percentSpanHTML = document.createElement("span");
        percentSpanHTML.textContent = `${percent}%`;

        const divHTML = document.createElement("div");

        const nameHTML = document.createElement("p");
        nameHTML.textContent = title;

        const visualHTML = document.createElement("span");
        visualHTML.setAttribute("style", `width: ${percent}%`);

        divHTML.append(nameHTML);
        divHTML.append(visualHTML);

        itemHTML.append(percentSpanHTML);
        itemHTML.append(divHTML);

        return itemHTML;
    };
});
